// ═══════════════════════════════════════════════
// SKILLS ASSESSMENT (Package J — Skills)
// Self-identification of work types and thinking styles.
// Maps to: Insights -> Skills
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Wrench, Brain } from 'lucide-react';

const WORK_TYPES = ['Technical', 'Creative', 'Physical', 'Social', 'Analytical'];
const THINKING_STYLES = ['First principles', 'Pattern recognition', 'Systems thinking', 'Empathy', 'Problem decomposition'];

const WORK_COLORS = {
  Technical: 'hsl(199 56% 64%)',
  Creative: 'hsl(265 41% 64%)',
  Physical: 'hsl(120 40% 58%)',
  Social: 'hsl(21 73% 69%)',
  Analytical: 'hsl(48 67% 74%)',
};

export default function SkillsAssessment() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);
  const [selectedThinking, setSelectedThinking] = useState(null);

  useEffect(() => {
    base44.entities.SkillAssessment.list('-created_date', 10).then(data => {
      setAssessments(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!selectedWork || !selectedThinking) return;
    try {
      const entry = await base44.entities.SkillAssessment.create({
        work_type: selectedWork,
        thinking_style: selectedThinking,
      });
      setAssessments(prev => [entry, ...prev]);
      setSelectedWork(null);
      setSelectedThinking(null);
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="w-6 h-6 mx-auto border-2 border-starlight/30 border-t-starlight rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="w-4 h-4 text-starlight" />
        <h3 className="font-heading font-semibold text-sm text-starlight">Skills</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Work Type</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {WORK_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedWork(type)}
                className={`text-xs px-3 py-2 rounded-lg transition-all ${selectedWork === type ? '' : 'bg-secondary/30 text-muted-foreground'}`}
                style={selectedWork === type ? { backgroundColor: `${WORK_COLORS[type]}20`, color: WORK_COLORS[type], borderColor: WORK_COLORS[type], borderWidth: 1 } : {}}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Thinking Style</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THINKING_STYLES.map(style => (
              <button
                key={style}
                onClick={() => setSelectedThinking(style)}
                className={`text-xs px-3 py-2 rounded-lg transition-all ${selectedThinking === style ? 'bg-purple-accent/15 text-purple-accent border border-purple-accent' : 'bg-secondary/30 text-muted-foreground'}`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {selectedWork && selectedThinking && (
          <button
            onClick={handleSave}
            className="w-full py-2 rounded-lg bg-starlight/15 text-starlight text-sm font-medium"
          >
            Save Assessment
          </button>
        )}
      </div>

      {assessments.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] text-muted-foreground">Recent assessments:</p>
          {assessments.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
              <Brain className="w-3 h-3 text-purple-accent shrink-0" />
              <span className="text-xs" style={{ color: WORK_COLORS[a.work_type] }}>{a.work_type}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-xs text-purple-accent">{a.thinking_style}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}