export class Legend {
  constructor(rampColor: Record<number, string>) {
    const items = Object.entries(rampColor)
      .map(([strVal, color]) => ({
        value: parseInt(strVal),
        color,
      }))
      .sort((a, b) => (a.value < b.value ? -1 : 1));

    const container = document.createElement("div");
    container.className = "legend";

    const colors = document.createElement("div");
    colors.className = "colors";

    items.forEach(({ value, color }) => {
      const group = document.createElement("div");
      group.className = "group";

      const rectangle = document.createElement("div");
      rectangle.className = "rectangle";
      rectangle.style.backgroundColor = color;

      const label = document.createElement("span");
      label.textContent = value.toString();

      group.append(rectangle, label);
      colors.append(group);
    });

    const text = document.createElement("div");
    text.textContent = "Vitesse du vent en m/s";
    container.append(colors, text);

    document.body.append(container);
  }
}
