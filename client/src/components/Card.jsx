import { Info } from "lucide-react";
import { useState } from "react";

function Card({ title, subtitle, children, action, description, tooltipAlign = "center", className = "" }) {
  const [showDescription, setShowDescription] = useState(false);

  const getTooltipPosition = () => {
    switch(tooltipAlign) {
      case 'right': return 'right-0 mb-2 translate-x-0';
      case 'left': return 'left-0 mb-2 translate-x-0';
      default: return 'left-1/2 mb-2 -translate-x-1/2';
    }
  };

  const getArrowPosition = () => {
    switch(tooltipAlign) {
      case 'right': return 'right-1.5';
      case 'left': return 'left-1.5';
      default: return 'left-1/2 -translate-x-1/2';
    }
  };

  return (
    <section className={`card relative hover-lift transition-all duration-300 animate-fade-in ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3 group/card-header">
          <div>
            {title && (
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight group-hover/card-header:text-primary transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                {description && (
                  <div className="relative flex items-center">
                    <div
                      className="transition-all duration-200 select-none cursor-default"
                      style={{ 
                        color: showDescription ? "var(--primary)" : "var(--text-muted)",
                        transform: showDescription ? "scale(1.15)" : "scale(1)"
                      }}
                      onMouseEnter={() => setShowDescription(true)}
                      onMouseLeave={() => setShowDescription(false)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Info size={15} />
                    </div>
                    
                    {/* Tooltip Description Popup */}
                    {showDescription && (
                      <div 
                        className={`absolute bottom-full z-50 w-56 p-3 rounded-lg border shadow-xl animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200 pointer-events-none ${getTooltipPosition()}`}
                        style={{ 
                          backgroundColor: "var(--bg-subtle)", 
                          borderColor: "var(--border-default)",
                          backdropFilter: "blur(12px)",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                        }}
                      >
                        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
                          Calculation Basis
                        </h4>
                        <p className="text-xs leading-relaxed font-medium" style={{ color: "var(--text-secondary)" }}>
                          {description}
                        </p>
                        {/* Triangle Arrow */}
                        <div 
                          className={`absolute -bottom-1.5 w-3 h-3 rotate-45 border-r border-b ${getArrowPosition()}`}
                          style={{ 
                            backgroundColor: "var(--bg-subtle)", 
                            borderColor: "var(--border-default)"
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {subtitle && (
              <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}

export default Card;
