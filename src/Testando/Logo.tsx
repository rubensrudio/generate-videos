import { Img, staticFile } from "remotion";

export const Logo: React.FC<{ size?: number; radius?: number }> = ({
  size = 100,
  radius = 22,
}) => {
  return (
    <Img
      src={staticFile("images/logo.jpg")}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        objectFit: "cover",
        display: "block",
      }}
    />
  );
};
