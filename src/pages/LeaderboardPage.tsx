import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/providers/UserProvider";

interface LeaderboardEntry {
  user_id: string;
  total_earned: number;
  display_name: string;
  country_code: string;
}

const GAME_TYPES = [
  { value: "all", label: "All Games", icon: "🎮" },
  { value: "swipe", label: "Swipe", icon: "👆" },
  { value: "higherlower", label: "Higher/Lower", icon: "📊" },
  { value: "thisthat", label: "This or That", icon: "⚖️" },
  { value: "bracket", label: "Bracket", icon: "🏆" },
];

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  ES: "🇪🇸",
  IT: "🇮🇹",
  JP: "🇯🇵",
  CN: "🇨🇳",
  IN: "🇮🇳",
  BR: "🇧🇷",
  MX: "🇲🇽",
  KR: "🇰🇷",
};

const LeaderboardPage = () => {
  const { user } = useUser();
  const [gameType, setGameType] = useState("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [gameType]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (gameType === "all") {
        // Fetch from user_stats
        const { data, error } = await supabase
          .from("user_stats")
          .select(`
            user_id,
            total_earned,
            leaderboard_profiles!inner(
              display_name,
              country_code,
              is_visible
            )
          `)
          .eq("leaderboard_profiles.is_visible", true)
          .order("total_earned", { ascending: false })
          .limit(100);

        if (error) throw error;

        const formatted = data?.map((entry: any) => ({
          user_id: entry.user_id,
          total_earned: entry.total_earned,
          display_name: entry.leaderboard_profiles.display_name,
          country_code: entry.leaderboard_profiles.country_code,
        })) || [];

        setLeaderboard(formatted);
      } else {
        // Fetch from game_type_earnings
        const { data, error } = await supabase
          .from("game_type_earnings")
          .select(`
            user_id,
            total_earned,
            leaderboard_profiles!inner(
              display_name,
              country_code,
              is_visible
            )
          `)
          .eq("game_type", gameType)
          .eq("leaderboard_profiles.is_visible", true)
          .order("total_earned", { ascending: false })
          .limit(100);

        if (error) throw error;

        const formatted = data?.map((entry: any) => ({
          user_id: entry.user_id,
          total_earned: entry.total_earned,
          display_name: entry.leaderboard_profiles.display_name,
          country_code: entry.leaderboard_profiles.country_code,
        })) || [];

        setLeaderboard(formatted);
      }

      // Get user's rank
      if (user?.id) {
        const { data: rankData } = await supabase.rpc("get_user_rank", {
          p_user_id: user.id,
          p_game_type: gameType === "all" ? null : gameType,
        });

        if (rankData && rankData.length > 0) {
          setUserRank(Number(rankData[0].rank));
        }
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30";
    return "bg-card border-border";
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="h-8 w-8 text-bronze" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">Top earners across all games</p>
      </div>

      {/* Your Rank Badge */}
      {userRank && (
        <div className="mb-4 p-4 bg-bronze/10 border border-bronze/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Your Rank</span>
            <span className="text-2xl font-bold coin">#{userRank}</span>
          </div>
        </div>
      )}

      {/* Game Filter */}
      <div className="mb-6">
        <Select value={gameType} onValueChange={setGameType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select game" />
          </SelectTrigger>
          <SelectContent>
            {GAME_TYPES.map((game) => (
              <SelectItem key={game.value} value={game.value}>
                <span className="flex items-center gap-2">
                  <span>{game.icon}</span>
                  <span>{game.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No leaderboard data yet</p>
          <p className="text-sm">Start playing to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.user_id === user?.id;

            return (
              <div
                key={entry.user_id}
                className={`p-4 rounded-lg border transition-all ${getRankBgColor(rank)} ${
                  isCurrentUser ? "ring-2 ring-bronze" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(rank) || (
                      <span className="text-xl font-bold text-muted-foreground">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Flag & Name */}
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-2xl">
                      {COUNTRY_FLAGS[entry.country_code] || "🌍"}
                    </span>
                    <span className="font-medium truncate">
                      {entry.display_name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs coin">(You)</span>
                      )}
                    </span>
                  </div>

                  {/* Earnings */}
                  <div className="text-right">
                    <div className="font-bold coin text-lg">
                      ${entry.total_earned.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
