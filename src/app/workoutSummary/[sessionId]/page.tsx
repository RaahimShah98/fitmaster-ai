import WorkoutSessionSummary from "./Summary";
import FloatingNav from "@/components/FloatingNav";
import UserDashboardMenu from "../../UserDashboard/sideBar";

export default function WorkoutSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return (
    <div className="flex flex-row w-full">
      <FloatingNav />
      <div className=" w-full flex flow-row relative top-19 pt-16  bg-gray-800 ">
        <div className=" w-full">
          <WorkoutSessionSummary sessionId={params.sessionId} />
        </div>
      </div>
    </div>
  );
}
