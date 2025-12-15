import Login from "@/components/custom/Login";

export default function LoginForm() {
  return (
    <div className="relative h-full">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source src="/estudiantes.mp4" type="video/mp4" />
        Tu navegador no soporta la etiqueta de video.
      </video>
      <div className="absolute inset-0 bg-black opacity-60 -z-10"></div>
      <Login />
    </div>
  );
};