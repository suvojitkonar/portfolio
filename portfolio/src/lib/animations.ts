export default class Animations {
  static animations = new Animations();

  fadeInScreen = (screenName: string) => {
    if (typeof document === "undefined") return;
    const screen = document.getElementById(screenName);
    if (!screenName || !screen) return;

    screen.style.opacity = "1";
    screen.style.transform = "translateY(0)";
  };
}
