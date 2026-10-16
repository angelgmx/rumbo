import type { TopicSummary } from "@rumbo/core";
import { Fragment } from "react";
import { useRumbo } from "@/app/RumboContext";
import { checkpoints } from "../checkpoints";
import { CheckpointMilestone } from "./CheckpointMilestone";
import { ColumnsHeader } from "./ColumnsHeader";
import { groupByWeek, todayAt } from "./groupWeeks";
import { ModuleRow } from "./ModuleRow";
import { TodayLine } from "./TodayLine";
import { WeekSection } from "./WeekSection";

/**
 * La ruta por semanas como línea de tiempo vertical: cada semana, sus módulos como filas,
 * los retos como hitos tras el módulo que los desbloquea y una línea en la semana de hoy.
 */
export function RoadmapWeeks({
  topic,
  onOpenChallenge,
}: {
  topic: TopicSummary;
  onOpenChallenge: (path: string) => void;
}) {
  const rumbo = useRumbo();
  const roadmap = topic.roadmap!;
  const today = rumbo.daily.today();
  const groups = groupByWeek(roadmap);
  const at = todayAt(groups, today);
  const milestones = checkpoints(roadmap, topic.challenges);

  return (
    <div className="flex flex-col gap-3">
      <ColumnsHeader />
      <ol className="relative flex flex-col gap-5 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-border">
        {groups.map((group) => {
          const marked = at?.group === group;
          const current = marked && at.thisWeek;
          return (
            <Fragment key={group.key}>
              {marked && !current && (
                <li className="pl-9">
                  <TodayLine today={today} />
                </li>
              )}
              <WeekSection group={group} roadmap={roadmap} current={current}>
                {current && (
                  <div className="pl-9">
                    <TodayLine today={today} />
                  </div>
                )}
                {group.modules.map((module) => (
                  <Fragment key={module.path}>
                    <ModuleRow
                      topicPath={topic.path}
                      roadmap={roadmap}
                      module={module}
                      today={today}
                    />
                    {milestones
                      .filter(({ after }) => after.path === module.path)
                      .map((checkpoint) => (
                        <CheckpointMilestone
                          key={checkpoint.challenge.path}
                          checkpoint={checkpoint}
                          onOpen={onOpenChallenge}
                        />
                      ))}
                  </Fragment>
                ))}
              </WeekSection>
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
