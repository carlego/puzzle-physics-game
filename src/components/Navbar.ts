export interface NavbarOptions {
  onBack?: () => void;
}

export class Navbar {
  private container: HTMLElement;
  private options: NavbarOptions;

  constructor(container: HTMLElement, options: NavbarOptions = {}) {
    this.container = container;
    this.options = options;

    this.render();
  }

  private render() {
    const nav = document.createElement("div");
    nav.className = "navbar";

    const backBtn = document.createElement("button");
    backBtn.textContent = "⬅ Back";
    backBtn.onclick = () => {
      if (this.options.onBack) this.options.onBack();
      else window.history.back();
    };

    nav.appendChild(backBtn);
    this.container.appendChild(nav);
  }
}
