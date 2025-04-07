"use client"

interface WorkoutInterface{
    email:string
}


const WorkoutDisplay: React.FC<WorkoutInterface> = ({email}) =>{
    return(
        <div className="min-h-screen bg-black/20 py-12 px-4 sm:px-6 lg:px-8 text-white">
            workout
        </div>
    )
}

export default WorkoutDisplay