#!/bin/bash
# Moltstream Episode Generator
# Fetches trending Moltbook posts and converts them to audio
# Uses macOS 'say' for FREE audio generation (can upgrade to ElevenLabs later)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
EPISODES_DIR="$PROJECT_DIR/public/episodes"
INDEX_FILE="$EPISODES_DIR/index.json"
MOLTBOOK_API="https://www.moltbook.com/api/v1"

# Config
MAX_EPISODES_PER_RUN=3  # Budget: limit episodes per run
MIN_SCORE=500           # Only posts with good engagement (500+ upvotes)
MAX_CONTENT_LENGTH=1200 # Limit content length for TTS

# macOS voices for different agents (rotate through these)
# Premium voices available on macOS: Samantha, Alex, Daniel, Karen, Moira, Tessa
VOICES=("Samantha" "Alex" "Daniel" "Karen" "Moira" "Tessa" "Fiona" "Victoria")

# Create episodes directory if needed
mkdir -p "$EPISODES_DIR"

# Initialize index if not exists
if [ ! -f "$INDEX_FILE" ]; then
    echo '{"episodes":[],"lastUpdated":""}' > "$INDEX_FILE"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Get a voice for an agent (consistent per agent name)
get_voice_for_agent() {
    local agent_name="$1"
    # Simple hash: sum of ASCII values mod number of voices
    local sum=0
    for ((i=0; i<${#agent_name}; i++)); do
        sum=$((sum + $(printf '%d' "'${agent_name:$i:1}")))
    done
    local index=$((sum % ${#VOICES[@]}))
    echo "${VOICES[$index]}"
}

# Check if we already have an episode for this post
episode_exists() {
    local post_id="$1"
    jq -e ".episodes[] | select(.postId == \"$post_id\")" "$INDEX_FILE" > /dev/null 2>&1
}

# Generate audio for a post using macOS say
generate_episode() {
    local post_id="$1"
    local title="$2"
    local content="$3"
    local author="$4"
    local submolt="$5"
    
    log "Generating episode for: $title"
    
    local episode_id="ep-$(date +%Y%m%d)-${post_id:0:8}"
    local aiff_file="${episode_id}.aiff"
    local audio_file="${episode_id}.mp3"
    local aiff_path="${EPISODES_DIR}/${aiff_file}"
    local audio_path="${EPISODES_DIR}/${audio_file}"
    
    # Build the script - clean up for TTS
    local clean_title=$(echo "$title" | sed 's/[📄👾🚧🦞🔥💊💥]//g' | sed 's/[^a-zA-Z0-9 .,!?-]/ /g' | tr -s ' ')
    
    # Forge AI sponsor intro
    local script="Moltstream is brought to you by Forge AI: the birthplace of competitive agentic trading. "
    script+="Now, from the ${submolt} community, ${author} posted: ${clean_title}. "
    
    # Add content if available (truncate if too long, clean for TTS)
    if [ -n "$content" ] && [ "$content" != "null" ]; then
        local clean_content=$(echo "${content:0:$MAX_CONTENT_LENGTH}" | sed 's/```[^`]*```//g' | sed 's/[^a-zA-Z0-9 .,!?-]/ /g' | tr -s ' ')
        script+="$clean_content"
    fi
    
    # Get voice for author
    local voice=$(get_voice_for_agent "$author")
    
    log "Using macOS voice: $voice"
    log "Script length: ${#script} chars"
    
    # Generate audio using macOS say (FREE!)
    if ! say -v "$voice" -o "$aiff_path" "$script" 2>&1; then
        log "ERROR: say command failed"
        return 1
    fi
    
    # Convert to MP3 using ffmpeg (if available) for smaller files
    if command -v ffmpeg &> /dev/null && [ -f "$aiff_path" ]; then
        log "Converting to MP3..."
        if ffmpeg -y -i "$aiff_path" -codec:a libmp3lame -qscale:a 4 "$audio_path" 2>/dev/null; then
            rm -f "$aiff_path"
            log "Converted to MP3"
        else
            # Fallback: keep AIFF
            mv "$aiff_path" "${EPISODES_DIR}/${episode_id}.aiff"
            audio_file="${episode_id}.aiff"
            audio_path="${EPISODES_DIR}/${audio_file}"
        fi
    else
        # No ffmpeg, keep AIFF
        audio_file="${episode_id}.aiff"
        audio_path="$aiff_path"
    fi
    
    if [ -f "$audio_path" ]; then
        local file_size=$(stat -f%z "$audio_path" 2>/dev/null || stat -c%s "$audio_path")
        log "Audio generated: $audio_file (${file_size} bytes)"
        
        # Add to index
        local new_episode=$(jq -n \
            --arg id "$episode_id" \
            --arg title "$title" \
            --arg submolt "$submolt" \
            --arg postId "$post_id" \
            --arg audioFile "$audio_file" \
            --arg createdAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
            --arg author "$author" \
            '{id: $id, title: $title, submolt: $submolt, postId: $postId, speakers: [$author], audioFile: $audioFile, createdAt: $createdAt}')
        
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

# Main execution
main() {
    log "=== Moltstream Episode Generator ==="
    log "Budget mode: max $MAX_EPISODES_PER_RUN episodes per run"
    
    # Fetch posts
    log "Fetching trending posts from Moltbook..."
    local api_response=$(curl -s "${MOLTBOOK_API}/posts?sort=hot&limit=20")
    
    if [ -z "$api_response" ]; then
        log "ERROR: Empty API response"
        exit 1
    fi
    
    # Check if response is valid JSON
    if ! echo "$api_response" | jq -e '.posts' > /dev/null 2>&1; then
        log "ERROR: Invalid API response"
        echo "$api_response" | head -100
        exit 1
    fi
    
    local post_count=$(echo "$api_response" | jq '.posts | length')
    log "Found $post_count posts"
    
    local generated=0
    
    # Process posts
    for i in $(seq 0 $((post_count - 1))); do
        if [ $generated -ge $MAX_EPISODES_PER_RUN ]; then
            log "Reached episode limit ($MAX_EPISODES_PER_RUN) for this run"
            break
        fi
        
        local post=$(echo "$api_response" | jq ".posts[$i]")
        local post_id=$(echo "$post" | jq -r '.id')
        local title=$(echo "$post" | jq -r '.title')
        local content=$(echo "$post" | jq -r '.content // empty')
        local author=$(echo "$post" | jq -r '.author.name')
        local submolt=$(echo "$post" | jq -r '.submolt.name')
        local score=$(echo "$post" | jq -r '.upvotes // 0')
        
        log "Checking post: $title (score: $score)"
        
        # Skip if score too low
        if [ "$score" -lt $MIN_SCORE ]; then
            log "  -> Skipping: score below threshold ($MIN_SCORE)"
            continue
        fi
        
        # Skip if already exists
        if episode_exists "$post_id"; then
            log "  -> Skipping: episode already exists"
            continue
        fi
        
        # Generate episode
        log "  -> Generating episode..."
        if generate_episode "$post_id" "$title" "$content" "$author" "$submolt"; then
            generated=$((generated + 1))
            log "  -> Success! ($generated/$MAX_EPISODES_PER_RUN)"
        else
            log "  -> Failed to generate"
        fi
    done
    
    log "=== Generation complete: $generated new episodes ==="
}

main "$@"
