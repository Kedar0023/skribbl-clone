import { SketchButton } from "~/components/Button";

const Doodles =()=>{
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
  <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#ffd6e7] blur-2xl opacity-80" />
  <div className="absolute top-24 right-[-90px] h-80 w-80 rounded-full bg-[#c9f7e5] blur-2xl opacity-80" />
  <div className="absolute bottom-[-140px] left-[15%] h-96 w-96 rounded-full bg-[#d9d2ff] blur-3xl opacity-60" />

  {/* doodle dots */}
  <div className="absolute top-[16%] left-[8%] text-3xl rotate-12 opacity-60">
    • • •
  </div>
  <div className="absolute top-[24%] right-[10%] text-4xl rotate-[-15deg] opacity-50">
    ✦
  </div>
  <div className="absolute bottom-[18%] left-[9%] text-3xl rotate-12 opacity-50">
    ~
  </div>


  {/* new doodle marks */}
  <div className="absolute top-[8%] right-[28%] text-2xl rotate-[8deg] opacity-40">
    ✧
  </div>
  <div className="absolute top-[55%] left-[4%] text-3xl rotate-[-6deg] opacity-40">
    ◦ ◦ ◦
  </div>
  <div className="absolute bottom-[30%] right-[6%] text-3xl rotate-[20deg] opacity-40">
    ✳
  </div>
  <div className="absolute top-[38%] right-[18%] text-2xl rotate-[-10deg] opacity-40">
    +
  </div>
  <div className="absolute bottom-[6%] left-[30%] text-3xl rotate-[15deg] opacity-40">
    ~
  </div>

  <svg
    className="absolute left-[5%] top-[42%] w-20 opacity-40"
    viewBox="0 0 100 50"
    fill="none"
  >
    <path
      d="M5 35C22 8 38 45 54 20C65 4 77 24 95 8"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>

  <svg
    className="absolute right-[5%] bottom-[28%] w-24 opacity-40"
    viewBox="0 0 100 50"
    fill="none"
  >
    <path
      d="M5 8C25 35 38 5 55 30C68 48 78 23 95 40"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>

  {/* new squiggle lines */}
  <svg
    className="absolute left-[30%] top-[10%] w-16 opacity-30 rotate-45"
    viewBox="0 0 100 50"
    fill="none"
  >
    <path
      d="M5 25C20 5 35 45 50 25C65 5 80 45 95 25"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>

  <svg
    className="absolute right-[20%] top-[65%] w-20 opacity-30 -rotate-12"
    viewBox="0 0 100 50"
    fill="none"
  >
    <path
      d="M5 15C15 40 30 5 45 30C55 45 70 10 95 35"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>

  {/* new circle/ring outlines */}
  <svg
    className="absolute left-[45%] bottom-[8%] w-10 h-10 opacity-30"
    viewBox="0 0 40 40"
    fill="none"
  >
    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" />
  </svg>

  <svg
    className="absolute right-[35%] top-[5%] w-8 h-8 opacity-30"
    viewBox="0 0 40 40"
    fill="none"
  >
    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" />
  </svg>

  {/* new zigzag */}
  <svg
    className="absolute left-[12%] bottom-[35%] w-14 opacity-30"
    viewBox="0 0 100 30"
    fill="none"
  >
    <path
      d="M5 25L25 5L45 25L65 5L85 25L95 15"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>
    );
};

export default Doodles;