import { motion } from 'framer-motion'
import Disclaimer from '../components/Disclaimer'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20 },
}

export default function Diet() {
  const recommendedFoods = [
    {
      name: 'Leafy Green Vegetables',
      image: '/assets/diet/leafy_greens.png',
      benefits: 'Rich in Vitamin C and antioxidants that speed up wound healing and improve skin integrity.',
      examples: 'Spinach, Kale, Cabbage',
    },
    {
      name: 'Lean Protein Sources',
      image: '/assets/diet/lean_protein.png',
      benefits: 'Provides essential amino acids necessary for tissue repair, cell growth, and muscle recovery.',
      examples: 'Chicken breast, Eggs, Tofu, Fish',
    },
    {
      name: 'Complex Carbohydrates',
      image: '/assets/diet/complex_carbs.png',
      benefits: 'High in fiber, helps maintain stable blood sugar levels and prevents hyperglycemia spikes.',
      examples: 'Brown rice, Oats, Beans, Quinoa',
    },
    {
      name: 'Healthy Fat Sources',
      image: '/assets/diet/healthy_fats.png',
      benefits: 'Improves blood flow and supports cell membrane health, reducing inflammation.',
      examples: 'Avocado, Walnuts, Chia Seeds, Olive oil',
    },
  ]

  const avoidFoods = [
    {
      name: 'Sugary Desserts & Sodas',
      image: '/assets/diet/sugary_desserts.png',
      reason: 'Causes sharp spikes in blood glucose levels, which directly impairs white blood cell function and delays wound healing.',
      examples: 'Cakes, Ice cream, Soft drinks',
    },
    {
      name: 'Refined White Grains',
      image: '/assets/diet/refined_grains.png',
      reason: 'Digests extremely quickly, leading to rapid blood sugar fluctuations and compromising vascular health.',
      examples: 'White bread, White pasta, White rice',
    },
    {
      name: 'Trans & Saturated Fats',
      image: '/assets/diet/trans_fats.png',
      reason: 'Clogs arteries and restricts blood circulation to the lower limbs, increasing risk of nerve death.',
      examples: 'Fried foods, Margarine, Processed snacks',
    },
    {
      name: 'High-Sodium Processed Foods',
      image: '/assets/diet/high_sodium.png',
      reason: 'Elevates blood pressure and worsens peripheral arterial disease, preventing healing nutrients from reaching the feet.',
      examples: 'Canned soups, Frozen meals, Potato chips',
    },
  ]

  const footCareSteps = [
    {
      step: 1,
      title: 'Inspect Feet Daily',
      icon: '🔍',
      desc: 'Check the tops, bottoms, and sides of your feet and between your toes for blisters, cuts, redness, or swelling. Use a mirror if needed.',
    },
    {
      step: 2,
      title: 'Wash in Lukewarm Water',
      icon: '🚿',
      desc: 'Wash feet daily in lukewarm (not hot) water. Do not soak feet, as this dries out the skin and makes it prone to cracking.',
    },
    {
      step: 3,
      title: 'Moisturize Carefully',
      icon: '🧴',
      desc: 'Apply a thin layer of moisturizing lotion to the tops and bottoms of your feet, but NEVER between the toes, as excess moisture causes fungal growth.',
    },
    {
      step: 4,
      title: 'Wear Diabetic Socks & Shoes',
      icon: '👟',
      desc: 'Always wear clean, dry, seamless socks and well-fitted closed-toe shoes. Never walk barefoot, even indoors.',
    },
  ]

  const language = localStorage.getItem('language') || 'english'

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <h1 className="page-title">
        {language === 'english' ? '🥗 Diet & Foot Care Guide' : '🥗 உணவு மற்றும் கால் பராமரிப்பு வழிகாட்டி'}
      </h1>
      <p className="page-subtitle">
        {language === 'english' 
          ? 'Nutrition recommendations and daily foot hygiene checklist to prevent DFU complications'
          : 'நீரிழிவு கால் புண் வராமல் தடுக்க ஊட்டச்சத்து பரிந்துரைகள் மற்றும் கால் பராமரிப்பு'}
      </p>

      {/* Section 1: Recommended Foods */}
      <h2 className="section-title">
        {language === 'english' ? '🥦 Recommended Foods for Healing' : '🥦 குணமடைய பரிந்துரைக்கப்படும் உணவுகள்'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-9">
        {recommendedFoods.map((food, i) => (
          <div
            key={i}
            className="glass-card-xl p-8 flex flex-col justify-between"
            style={{
              borderLeft: '4px solid #39ff14',
            }}
          >
            <div>
              <div
                className="mb-6 w-full h-48 rounded-2xl overflow-hidden flex items-center justify-center relative"
                style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.15)' }}
              >
                <img src={food.image} alt={food.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1612] to-transparent opacity-40 pointer-events-none"></div>
              </div>
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
              >
                {food.name}
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text)' }}>
                {food.benefits}
              </p>
            </div>
            <div
              className="text-xs px-4 py-3 rounded-xl italic"
              style={{
                background: 'rgba(57,255,20,0.05)',
                border: '1px solid rgba(57,255,20,0.1)',
                color: 'var(--color-text-secondary)',
              }}
            >
              ✦ {food.examples}
            </div>
          </div>
        ))}
      </div>

      {/* Section 2: Foods to Avoid */}
      <h2 className="section-title">⚠️ Foods to Limit or Avoid</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {avoidFoods.map((food, i) => (
          <div
            key={i}
            className="glass-card-xl p-8 flex flex-col justify-between"
            style={{ borderLeft: '4px solid #ff4444' }}
          >
            <div>
              <div
                className="mb-6 w-full h-48 rounded-2xl overflow-hidden flex items-center justify-center relative"
                style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.15)' }}
              >
                <img src={food.image} alt={food.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1612] to-transparent opacity-40 pointer-events-none"></div>
              </div>
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: '#ff7777', fontFamily: 'Poppins, sans-serif' }}
              >
                {food.name}
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text)' }}>
                {food.reason}
              </p>
            </div>
            <div
              className="text-xs px-4 py-3 rounded-xl italic"
              style={{
                background: 'rgba(255,68,68,0.05)',
                border: '1px solid rgba(255,68,68,0.1)',
                color: 'var(--color-text-secondary)',
              }}
            >
              ✦ {food.examples}
            </div>
          </div>
        ))}
      </div>

      {/* Section 3: Daily Foot Care Checklist */}
      <h2 className="section-title">👣 Daily Foot Hygiene Checklist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {footCareSteps.map((step, i) => (
          <div
            key={i}
            className="glass-card-xl p-8 flex flex-col gap-5"
            style={{
              borderLeft: '4px solid var(--color-accent)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold px-4 py-1.5 rounded-full"
                style={{
                  background: 'rgba(57,255,20,0.1)',
                  color: 'var(--color-accent)',
                  border: '1px solid rgba(57,255,20,0.2)',
                  fontFamily: 'Poppins, sans-serif',
                  letterSpacing: '0.05em',
                }}
              >
                STEP {step.step}
              </span>
              <span className="text-2xl">{step.icon}</span>
            </div>
            <div>
              <h3
                className="text-base font-bold mb-2"
                style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--color-text)' }}
              >
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Consultation reminder */}
      <div
        className="p-6 rounded-2xl text-center mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(57,255,20,0.05), rgba(57,255,20,0.03))',
          border: '1px solid rgba(57,255,20,0.18)',
        }}
      >
        <p
          className="text-base font-bold mb-2"
          style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
        >
          👨‍⚕️ Important Diet Consultation Reminder
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text)', lineHeight: '1.7' }}>
          Every diabetic patient has unique metabolic responses. Consult your clinical dietitian or diabetologist to tailor a custom dietary plan that fits your current glycemic profile.
        </p>
      </div>

      <Disclaimer />
    </motion.div>
  )
}
