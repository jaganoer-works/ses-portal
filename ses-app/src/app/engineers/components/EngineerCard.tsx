import Link from "next/link";
import { EngineerListItem } from "@/lib/types/user";

type EngineerCardProps = {
  engineer: EngineerListItem;
};

export function EngineerCard({ engineer }: EngineerCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('ja-JP');
    } catch {
      return dateString.slice(0, 10);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "-";
    return `${price.toLocaleString()}円`;
  };

  const skillNames = engineer.skills.map(s => s.skill.name).join(", ") || "-";

  return (
    <Link
      href={`/engineers/${engineer.id}`}
      className="group block bg-card border border-gray-200 rounded-xl shadow-sm p-6 
                 hover:shadow-lg hover:border-accent/20 transition-all duration-200 
                 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      aria-label={`${engineer.name}の詳細を見る`}
    >
      <article className="flex flex-col gap-3">
        <header>
          <h2 className="font-bold text-lg text-accent-dark group-hover:text-accent transition-colors">
            {engineer.name}
          </h2>
        </header>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-sub font-medium min-w-0 flex-shrink-0">スキル:</span>
            <span className="text-accent truncate" title={skillNames}>
              {skillNames}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sub font-medium">希望単価:</span>
            <span className="text-accent-dark font-semibold">
              {formatPrice(engineer.desiredPrice)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sub font-medium">稼働開始日:</span>
            <span className="text-sub">
              {formatDate(engineer.availableFrom)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sub font-medium">ステータス:</span>
            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
              engineer.status === '稼働中' ? 'bg-green-100 text-green-800' :
              engineer.status === '待機中' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {engineer.status}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
} 