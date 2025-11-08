interface GameHeaderProps {
  gameType: string;
  title: string;
  description: string;
}
const GameHeader = ({
  gameType,
  title,
  description
}: GameHeaderProps) => {
  // Map game type to display name
  const getGameTypeDisplay = (type: string) => {
    switch (type) {
      case "swipe":
        return "Swipe";
      case "bracket":
        return "Bracket";
      case "thisthat":
        return "This or That";
      case "soundbyte":
        return "Sound Byte";
      case "higherlower":
        return "Higher or Lower";
      case "highlight":
        return "Highlight";
      case "adlibpro":
        return "Ad Lib Pro";
      case "logosort":
        return "Logo Sort";
      default:
        return type;
    }
  };
  return <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm font-medium px-2 py-0.5 bg-bronze/10 text-bronze rounded-full">
          {getGameTypeDisplay(gameType)}
        </span>
      </div>
      
      
    </div>;
};
export default GameHeader;