'use client';


export const FeaturesSection = () => {

  const features = [
    {
      title: "AI-Generated Workout Plans",
      description: " Our AI creates a personalized workout plan tailored to your goals, fitness level, and preferences. Whether you're building muscle, losing weight, or boosting endurance, FitMaster AI crafts the perfect routine—just for you!",
    },
    {
      title: "AI-Generated Diet Plans",
      description: "Our AI crafts personalized meal plans based on your goals, dietary preferences, and nutritional needs. Whether you're aiming to lose weight, build muscle, or maintain a balanced diet, FitMaster AI ensures every meal is optimized for your success!",
    },
    {
      title: "Fitness Goals Tracking",
      description: "FitMaster AI monitors your workouts, nutrition, and body metrics to track your fitness journey in real time. Set goals, get insights, and crush your milestones with AI-driven guidance!",
    },
    {
      title: "Community Challenges",
      description: " Join AI-powered fitness challenges, compete with friends, and push your limits alongside a supportive community. Earn rewards, track your rankings, and make fitness fun!",
    },
  ];

  return (
    <div   style={{
      backgroundImage: "url('/LandingPage/what-is-fitmaster.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <section className="py-16 bg-black/10 text-white relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-4xl font-bold mb-12">
            What is FitMaster-AI
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/70 w-full break-words">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>

  );
};

export default FeaturesSection;