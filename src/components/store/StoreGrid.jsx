import { motion } from 'framer-motion';
import { Check, Coins } from 'lucide-react';
import { isOwned } from '@/lib/sanctuary/storeCatalog';

export default function StoreGrid({ items, owned, balance, onBuy, accent }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(item => {
        const have = isOwned(owned, item.id);
        const affordable = balance >= item.price;
        return (
          <motion.button
            key={item.id}
            whileTap={have ? {} : { scale: 0.96 }}
            onClick={() => !have && affordable && onBuy(item)}
            disabled={have || !affordable}
            className="text-left p-3 rounded-xl glass framed no-tap-highlight disabled:opacity-60"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight mb-2">{item.note}</p>
            {have ? (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: accent }}>
                <Check className="w-3 h-3" /> Owned
              </span>
            ) : (
              <span className={`flex items-center gap-1 text-[11px] ${affordable ? 'text-gold' : 'text-muted-foreground'}`}>
                <Coins className="w-3 h-3" /> {item.price}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}