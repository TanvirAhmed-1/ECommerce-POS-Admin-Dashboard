"use client";

type LoaderProps = {
  size?: number;
};

export default function Loader({ size = 30 }: LoaderProps) {
  return (
    <div className="wrapper">
      <div className="loader" style={{ width: size, height: size }} />

      <style jsx>{`
        .wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 20vh;
          width: 100%;
        }

        .loader {
          aspect-ratio: 1;
          --_c: no-repeat radial-gradient(farthest-side, #6366f1 92%, #0000);

          background:
            var(--_c) top,
            var(--_c) left,
            var(--_c) right,
            var(--_c) bottom;

          background-size: 12px 12px;
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          to {
            transform: rotate(0.5turn);
          }
        }
      `}</style>
    </div>
  );
}