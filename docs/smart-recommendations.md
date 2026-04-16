## Smart Game Recommendation System

### Overview

The Smart Game Recommendation System intelligently suggests which game from your backlog to play next based on your gaming patterns, preferences, and history. It analyzes multiple factors to provide personalized recommendations.

### Architecture

#### Backend Service: `smartRecommendation.service.ts`

**Main Method:** `getSmartRecommendations(userId: string, limit: number = 5)`

Returns a scored list of recommended games from the user's backlog with explanations for why each game is recommended.

#### Scoring Algorithm

The system evaluates each backlog game on a 100-point scale using:

1. **Tag Similarity (0-20 points)**
   - Matches game tags against user's preferred tags (derived from top-rated games)
   - Formula: `(matching_tags / total_tags) * 20`
   - Bonus: Games with 5+ matching tags get explicit recommendation reason

2. **Platform Diversity (0-15 points)**
   - Encourages playing on underrepresented platforms
   - Less than 10% of library → 12 points
   - Less than 20% of library → 8 points
   - More than 20% of library → 3 points

3. **Similarity to Favorites (0-20 points)**
   - Compares game tags to tag combinations in top-rated games
   - Formula: `(max_similarity / favorite_combos) * 20`
   - Preference: Games with >5 points get "Similar to games you love" reason

4. **Completion Potential (0-15 points)**
   - Users with >70% completion rate get 8-point bonus
   - Encourages "completionists" to keep up their streak
   - Reason: "Good match for completion-oriented player"

5. **Achievement Hunting Bonus (0-10 points)**
   - Identified by >50% average achievement completion across library
   - Games with achievements get 8-point boost for these users
   - Reason: "Has achievements for you to hunt"

**Base Score:** 50 points
**Maximum Score:** 100 points

### User Profile Analysis

The system analyzes each user's library to understand:

- **Preferred Tags**: Top 10 tags from 10 highest-rated games
- **Favorite Tag Combinations**: Tag sets that appear in high-rated games
- **Platform Distribution**: How many games per platform
- **Completion Rate**: Percentage of library completed
- **Achievement Hunting**: Whether user actively pursues achievements

### API Endpoint

**Endpoint:** `GET /api/recommendations/:userId/smart`

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 5, max: 20)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "recommendations": [
    {
      "gameId": "game-uuid",
      "name": "Game Name",
      "score": 85,
      "reasons": [
        "Matches your preferred tags",
        "Similar to games you love"
      ],
      "playtimeForever": 3600,
      "rating": 4.5,
      "userTags": ["action", "adventure", "open-world"],
      "platform": "steam",
      "achievementRate": 0.75
    }
  ]
}
```

### Frontend Component

**Component:** `SmartRecommendationsList`

**Location:** `frontend/src/components/SmartRecommendationsList.tsx`

**Props:**
- `userId` (string, required): User ID to get recommendations for
- `limit` (number, optional): Max recommendations to display (default: 5)
- `onSelectGame` (function, optional): Callback when user clicks a recommendation

**Features:**
- Real-time loading state
- Color-coded match scores (green >75%, yellow 50-75%, red <50%)
- Visual score bar
- Recommendation reasoning (up to 2 reasons shown)
- Tag display (up to 3 tags, with +N indicator)
- Platform and rating badges
- Achievement percentage display

### How to Use

1. **Navigate to Smart Pick tab** in the Home page
2. **View recommendations** sorted by match score
3. **Read reasoning** to understand why each game is recommended
4. **Click on a game** to view details and manage it

### Example Scenarios

**Scenario 1: Action Game Enthusiast**
- Top-rated games: All "action" & "fast-paced"
- Backlog game: "Cyberpunk 2077" (action, open-world, RPG)
- Score: 88 (25 tag similarity + 8 platform + 15 favorites + 8 completion + 10 achievements)
- Reasons: "Matches your preferred tags", "Similar to games you love"

**Scenario 2: Casual Explorer**
- Few high ratings, varied genres
- Backlog game: "Unpopular Indie RPG" on minority platform
- Score: 72 (8 tag similarity + 12 platform + 10 favorites + 12 completion)
- Reasons: "Good match for completion-oriented player"

**Scenario 3: Achievement Hunter**
- High achievement completion rates (80%+)
- Backlog game: "Game with 50+ achievements"
- Score: 79 (base + achievements bonus)
- Reasons: "Has achievements for you to hunt"

### Algorithm Strengths

✅ **Personalized**: Uses actual user data and preferences
✅ **Balanced**: Multiple factors prevent skewed recommendations
✅ **Transparent**: Explains why each game is recommended
✅ **Flexible**: Adapts to different player types (completionists, achievement hunters, etc.)
✅ **Scalable**: Efficient queries and calculations

### Potential Enhancements

- Playtime duration matching (recommend games matching user's play session length)
- Genre similarity scoring
- Recency boost (suggest newly added games)
- Seasonal recommendations
- Difficulty progression matching
- Multiplayer/Co-op filtering
- Session history analysis (what time of day user typically plays)

### Technical Implementation Notes

- Uses Prisma ORM for efficient database queries
- Analyzes top 10 rated games for profile building
- Filters only backlog games for recommendations
- Type-safe TypeScript implementation
- No external ML libraries (pure algorithmic scoring)
- Error handling and logging for debugging
