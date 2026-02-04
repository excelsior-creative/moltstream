#!/bin/bash
# Moltstream Episode Generator
# Fetches trending Moltbook posts and converts them to audio
# Uses ElevenLabs for high-quality audio with daily budget cap

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
EPISODES_DIR="$PROJECT_DIR/public/episodes"
INDEX_FILE="$EPISODES_DIR/index.json"
BUDGET_FILE="$EPISODES_DIR/.daily_budget"
MOLTBOOK_API="https://www.moltbook.com/api/v1"

# ElevenLabs Config
ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY:-}"
ELEVENLABS_API="https://api.elevenlabs.io/v1"

# Budget Config
# ~150 chars = 1 second of speech at normal pace
# 5 min target = 300 sec = ~45,000 chars/day
# 10 min max = 600 sec = ~90,000 chars/day
DAILY_CHAR_BUDGET=60000        # ~6-7 minutes of audio per day (middle ground)
MAX_EPISODES_PER_RUN=3         # Limit episodes per run
MIN_SCORE=500                  # Only posts with good engagement
MAX_CONTENT_LENGTH=1500        # Limit content per episode

# ElevenLabs voices (premium quality)
# Format: "voice_id:name"
VOICES=(
    "21m00Tcm4TlvDq8ikWAM:Rachel"      # Female, warm
    "AZnzlk1XvdvUeBnXmlld:Domi"        # Female, strong
    "EXAVITQu4vr4xnSDxMaL:Bella"       # Female, soft
    "ErXwobaYiN019PkySvjV:Antoni"      # Male, calm
    "MF3mGyEYCl7XYWbV9V6O:Elli"        # Female, young
    "TxGEqnHWrfWFTfGW9XjX:Josh"        # Male, deep
    "VR6AewLTigWG4xSOukaG:Arnold"      # Male, announcer
    "pNInz6obpgDQGcFmaJgB:Adam"        # Male, narration
    "yoZ06aMxZJJ28mfd3POQ:Sam"         # Male, raspy
)

# Sponsor intro (always the same voice - professional announcer)
INTRO_VOICE_ID="VR6AewLTigWG4xSOukaG"  # Arnold - announcer voice
INTRO_TEXT="Moltstream is brought to you by Forge AI: the birthplace of competitive agentic trading."

# Create directories
mkdir -p "$EPISODES_DIR"

# Initialize index if not exists
if [ ! -f "$INDEX_FILE" ]; then
    echo '{"episodes":[],"lastUpdated":""}' > "$INDEX_FILE"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check/reset daily budget
check_budget() {
    local today=$(date +%Y-%m-%d)
    local chars_used=0
    
    if [ -f "$BUDGET_FILE" ]; then
        local budget_date=$(head -1 "$BUDGET_FILE" | cut -d: -f1)
        if [ "$budget_date" = "$today" ]; then
            chars_used=$(head -1 "$BUDGET_FILE" | cut -d: -f2)
        fi
    fi
    
    echo "$chars_used"
}

update_budget() {
    local chars_to_add="$1"
    local today=$(date +%Y-%m-%d)
    local current=$(check_budget)
    local new_total=$((current + chars_to_add))
    echo "${today}:${new_total}" > "$BUDGET_FILE"
    log "Budget updated: ${new_total}/${DAILY_CHAR_BUDGET} chars used today"
}

remaining_budget() {
    local used=$(check_budget)
    echo $((DAILY_CHAR_BUDGET - used))
}

# Get a voice for an agent (consistent per agent name)
get_voice_for_agent() {
    local agent_name="$1"
    local sum=0
    for ((i=0; i<${#agent_name}; i++)); do
        sum=$((sum + $(printf '%d' "'${agent_name:$i:1}")))
    done
    local index=$((sum % ${#VOICES[@]}))
    local voice_entry="${VOICES[$index]}"
    echo "${voice_entry%%:*}"  # Return just the voice ID
}

get_voice_name() {
    local agent_name="$1"
    local sum=0
    for ((i=0; i<${#agent_name}; i++)); do
        sum=$((sum + $(printf '%d' "'${agent_name:$i:1}")))
    done
    local index=$((sum % ${#VOICES[@]}))
    local voice_entry="${VOICES[$index]}"
    echo "${voice_entry#*:}"  # Return just the name
}

# Check if we already have an episode for this post
episode_exists() {
    local post_id="$1"
    jq -e ".episodes[] | select(.postId == \"$post_id\")" "$INDEX_FILE" > /dev/null 2>&1
}

# Generate audio using ElevenLabs API
generate_audio_elevenlabs() {
    local text="$1"
    local voice_id="$2"
    local output_path="$3"
    
    local response=$(curl -s -w "\n%{http_code}" -X POST "${ELEVENLABS_API}/text-to-speech/${voice_id}" \
        -H "xi-api-key: ${ELEVENLABS_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"${text}\",
            \"model_id\": \"eleven_turbo_v2_5\",
            \"voice_settings\": {
                \"stability\": 0.5,
                \"similarity_boost\": 0.75
            }
        }" \
        --output "$output_path")
    
    local http_code=$(echo "$response" | tail -1)
    
    if [ "$http_code" != "200" ] || [ ! -s "$output_path" ]; then
        log "ERROR: ElevenLabs API returned $http_code"
        return 1
    fi
    
    return 0
}

# Generate episode
generate_episode() {
    local post_id="$1"
    local title="$2"
    local content="$3"
    local author="$4"
    local submolt="$5"
    
    log "Generating episode for: $title"
    
    local episode_id="ep-$(date +%Y%m%d)-${post_id:0:8}"
    local intro_file="${EPISODES_DIR}/${episode_id}-intro.mp3"
    local content_file="${EPISODES_DIR}/${episode_id}-content.mp3"
    local audio_file="${episode_id}.mp3"
    local audio_path="${EPISODES_DIR}/${audio_file}"
    
    # Clean up text for TTS
    local clean_title=$(echo "$title" | sed 's/[📄👾🚧🦞🔥💊💥🎮🤖💡🚀⚡️🔮]//g' | sed 's/[^a-zA-Z0-9 .,!?-]/ /g' | tr -s ' ')
    
    # Build the content script
    local content_script="From the ${submolt} community, ${author} posted: ${clean_title}. "
    
    if [ -n "$content" ] && [ "$content" != "null" ]; then
        local clean_content=$(echo "${content:0:$MAX_CONTENT_LENGTH}" | sed 's/```[^`]*```//g' | sed 's/[^a-zA-Z0-9 .,!?:;-]/ /g' | tr -s ' ')
        content_script+="$clean_content"
    fi
    
    # Calculate character count
    local intro_chars=${#INTRO_TEXT}
    local content_chars=${#content_script}
    local total_chars=$((intro_chars + content_chars))
    
    # Check budget
    local budget_remaining=$(remaining_budget)
    if [ $total_chars -gt $budget_remaining ]; then
        log "WARNING: Episode would exceed daily budget ($total_chars chars needed, $budget_remaining remaining)"
        if [ $budget_remaining -lt 5000 ]; then
            log "Skipping - budget too low"
            return 1
        fi
        # Truncate content to fit budget
        local max_content=$((budget_remaining - intro_chars - 100))
        content_script="${content_script:0:$max_content}..."
        total_chars=$((intro_chars + ${#content_script}))
        log "Truncated to fit budget: $total_chars chars"
    fi
    
    # Get voice for content
    local voice_id=$(get_voice_for_agent "$author")
    local voice_name=$(get_voice_name "$author")
    
    log "Using ElevenLabs voice: $voice_name (ID: $voice_id)"
    log "Total chars: $total_chars (Intro: $intro_chars, Content: ${#content_script})"
    
    # Generate intro audio
    log "Generating intro..."
    if ! generate_audio_elevenlabs "$INTRO_TEXT" "$INTRO_VOICE_ID" "$intro_file"; then
        log "ERROR: Failed to generate intro"
        return 1
    fi
    
    # Generate content audio
    log "Generating content..."
    if ! generate_audio_elevenlabs "$content_script" "$voice_id" "$content_file"; then
        log "ERROR: Failed to generate content"
        rm -f "$intro_file"
        return 1
    fi
    
    # Combine intro + content using ffmpeg
    log "Combining audio files..."
    if command -v ffmpeg &> /dev/null; then
        # Create file list for concat
        local concat_list="${EPISODES_DIR}/${episode_id}-concat.txt"
        echo "file '${intro_file}'" > "$concat_list"
        echo "file '${content_file}'" >> "$concat_list"
        
        if ffmpeg -y -f concat -safe 0 -i "$concat_list" -c copy "$audio_path" 2>/dev/null; then
            rm -f "$intro_file" "$content_file" "$concat_list"
            log "Combined audio created"
        else
            # Fallback: just use content with intro baked in
            log "Concat failed, using content only"
            mv "$content_file" "$audio_path"
            rm -f "$intro_file" "$concat_list"
        fi
    else
        # No ffmpeg, just use content
        mv "$content_file" "$audio_path"
        rm -f "$intro_file"
    fi
    
    if [ -f "$audio_path" ]; then
        local file_size=$(stat -f%z "$audio_path" 2>/dev/null || stat -c%s "$audio_path")
        log "Audio generated: $audio_file (${file_size} bytes)"
        
        # Update budget
        update_budget $total_chars
        
        # Add to index
        local new_episode=$(jq -n \
            --arg id "$episode_id" \
            --arg title "$title" \
            --arg submolt "$submolt" \
            --arg postId "$post_id" \
            --arg audioFile "$audio_file" \
            --arg createdAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
            --arg author "$author" \
            --arg voiceName "$voice_name" \
            '{id: $id, title: $title, submolt: $submolt, postId: $postId, speakers: [$author], voiceName: $voiceName, audioFile: $audioFile, createdAt: $createdAt}')
        
        # Update index.json
        local tmp_file=$(mktemp)
        jq --argjson ep "$new_episode" \
           --arg updated "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
           '.episodes = [$ep] + .episodes | .lastUpdated = $updated' \
           "$INDEX_FILE" > "$tmp_file" && mv "$tmp_file" "$INDEX_FILE"
        
        log "Episode added to index"
        return 0
    else
        log "ERROR: Audio file not created"
        return 1
    fi
}

# Regenerate existing episodes with ElevenLabs (one-time upgrade)
regenerate_existing() {
    log "=== Regenerating existing episodes with ElevenLabs ==="
    
    local episodes=$(jq -r '.episodes[] | @base64' "$INDEX_FILE")
    
    for ep in $episodes; do
        local episode=$(echo "$ep" | base64 --decode)
        local episode_id=$(echo "$episode" | jq -r '.id')
        local post_id=$(echo "$episode" | jq -r '.postId')
        local title=$(echo "$episode" | jq -r '.title')
        local submolt=$(echo "$episode" | jq -r '.submolt')
        local author=$(echo "$episode" | jq -r '.speakers[0]')
        local old_file=$(echo "$episode" | jq -r '.audioFile')
        
        local budget_remaining=$(remaining_budget)
        if [ $budget_remaining -lt 5000 ]; then
            log "Daily budget exhausted, stopping regeneration"
            break
        fi
        
        log "Regenerating: $title"
        
        # Fetch original content from Moltbook if needed
        local content=""
        local post_data=$(curl -s "${MOLTBOOK_API}/posts/${post_id}" 2>/dev/null)
        if [ -n "$post_data" ] && echo "$post_data" | jq -e '.content' > /dev/null 2>&1; then
            content=$(echo "$post_data" | jq -r '.content // empty')
        fi
        
        # Remove old audio file
        if [ -f "${EPISODES_DIR}/${old_file}" ]; then
            rm -f "${EPISODES_DIR}/${old_file}"
        fi
        
        # Remove from index temporarily
        local tmp_file=$(mktemp)
        jq --arg id "$episode_id" 'del(.episodes[] | select(.id == $id))' "$INDEX_FILE" > "$tmp_file"
        mv "$tmp_file" "$INDEX_FILE"
        
        # Regenerate with same ID
        if generate_episode "$post_id" "$title" "$content" "$author" "$submolt"; then
            log "  -> Upgraded!"
        else
            log "  -> Failed, skipping"
        fi
    done
}

# Main execution
main() {
    log "=== Moltstream Episode Generator (ElevenLabs) ==="
    
    # Check API key
    if [ -z "$ELEVENLABS_API_KEY" ]; then
        log "ERROR: ELEVENLABS_API_KEY not set"
        exit 1
    fi
    
    local budget_remaining=$(remaining_budget)
    log "Daily budget: ${budget_remaining}/${DAILY_CHAR_BUDGET} chars remaining"
    
    if [ $budget_remaining -lt 3000 ]; then
        log "Daily budget nearly exhausted, skipping generation"
        exit 0
    fi
    
    # Check for --regenerate flag
    if [ "$1" = "--regenerate" ]; then
        regenerate_existing
        exit 0
    fi
    
    # Fetch posts
    log "Fetching trending posts from Moltbook..."
    local api_response=$(curl -s "${MOLTBOOK_API}/posts?sort=hot&limit=20")
    
    if [ -z "$api_response" ]; then
        log "ERROR: Empty API response"
        exit 1
    fi
    
    if ! echo "$api_response" | jq -e '.posts' > /dev/null 2>&1; then
        log "ERROR: Invalid API response"
        exit 1
    fi
    
    local post_count=$(echo "$api_response" | jq '.posts | length')
    log "Found $post_count posts"
    
    local generated=0
    
    # Process posts
    for i in $(seq 0 $((post_count - 1))); do
        if [ $generated -ge $MAX_EPISODES_PER_RUN ]; then
            log "Reached episode limit ($MAX_EPISODES_PER_RUN)"
            break
        fi
        
        local budget_now=$(remaining_budget)
        if [ $budget_now -lt 3000 ]; then
            log "Budget exhausted for today"
            break
        fi
        
        local post=$(echo "$api_response" | jq ".posts[$i]")
        local post_id=$(echo "$post" | jq -r '.id')
        local title=$(echo "$post" | jq -r '.title')
        local content=$(echo "$post" | jq -r '.content // empty')
        local author=$(echo "$post" | jq -r '.author.name')
        local submolt=$(echo "$post" | jq -r '.submolt.name')
        local score=$(echo "$post" | jq -r '.upvotes // 0')
        
        log "Checking: $title (score: $score)"
        
        if [ "$score" -lt $MIN_SCORE ]; then
            log "  -> Skipping: score below threshold"
            continue
        fi
        
        if episode_exists "$post_id"; then
            log "  -> Skipping: episode exists"
            continue
        fi
        
        log "  -> Generating..."
        if generate_episode "$post_id" "$title" "$content" "$author" "$submolt"; then
            generated=$((generated + 1))
            log "  -> Success! ($generated/$MAX_EPISODES_PER_RUN)"
        else
            log "  -> Failed"
        fi
    done
    
    log "=== Complete: $generated new episodes ==="
}

main "$@"
