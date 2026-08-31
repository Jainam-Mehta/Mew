// Mew Pokémon Icon Component
const MewIcon = ({ className = "w-10 h-10" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mew - cute pink legendary Pokémon */}
      
      {/* Tail */}
      <path
        d="M 15 75 Q 5 85, 8 95 Q 10 98, 12 96 Q 18 88, 20 80"
        fill="#FFB3D9"
        stroke="#FF69B4"
        strokeWidth="1"
      />
      
      {/* Body */}
      <ellipse
        cx="50"
        cy="55"
        rx="22"
        ry="26"
        fill="#FFB3D9"
        stroke="#FF69B4"
        strokeWidth="1.5"
      />
      
      {/* Head */}
      <circle
        cx="50"
        cy="30"
        r="18"
        fill="#FFB3D9"
        stroke="#FF69B4"
        strokeWidth="1.5"
      />
      
      {/* Left Ear */}
      <ellipse
        cx="38"
        cy="18"
        rx="6"
        ry="10"
        fill="#FFB3D9"
        stroke="#FF69B4"
        strokeWidth="1"
        transform="rotate(-20 38 18)"
      />
      
      {/* Right Ear */}
      <ellipse
        cx="62"
        cy="18"
        rx="6"
        ry="10"
        fill="#FFB3D9"
        stroke="#FF69B4"
        strokeWidth="1"
        transform="rotate(20 62 18)"
      />
      
      {/* Left Eye */}
      <ellipse
        cx="44"
        cy="28"
        rx="3"
        ry="4"
        fill="#4169E1"
      />
      <circle
        cx="44.5"
        cy="27"
        r="1.5"
        fill="white"
      />
      
      {/* Right Eye */}
      <ellipse
        cx="56"
        cy="28"
        rx="3"
        ry="4"
        fill="#4169E1"
      />
      <circle
        cx="56.5"
        cy="27"
        r="1.5"
        fill="white"
      />
      
      {/* Nose/Mouth */}
      <path
        d="M 50 32 Q 48 34, 50 35 Q 52 34, 50 32"
        fill="#FF1493"
      />
      
      {/* Left Arm */}
      <ellipse
        cx="32"
        cy="50"
        rx="6"
        ry="14"
        fill="#FFB3D9"
        stroke="#FF69B4"
        strokeWidth="1"
        transform="rotate(-25 32 50)"
      />
      
      {/* Right Arm */}
      <ellipse
        cx="68"
        cy="50"
        rx="6"
        ry="14"
        fill="#FFB3D9"
        stroke="#FF69B4"
        strokeWidth="1"
        transform="rotate(25 68 50)"
      />
      
      {/* Left Foot */}
      <ellipse
        cx="42"
        cy="78"
        rx="7"
        ry="5"
        fill="#FFB3D9"
        stroke="#FF69B4"
        strokeWidth="1"
      />
      
      {/* Right Foot */}
      <ellipse
        cx="58"
        cy="78"
        rx="7"
        ry="5"
        fill="#FFB3D9"
        stroke="#FF69B4"
        strokeWidth="1"
      />
      
      {/* Belly spot */}
      <ellipse
        cx="50"
        cy="60"
        rx="8"
        ry="10"
        fill="#FFC0CB"
        opacity="0.6"
      />
    </svg>
  );
};

export default MewIcon;
