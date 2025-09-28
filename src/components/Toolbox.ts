export interface ToolboxOptions {
  onReset?: () => void;
}

export class Toolbox {
  private container: HTMLElement;
  private options: ToolboxOptions;

  constructor(container: HTMLElement, options: ToolboxOptions = {}) {
    this.container = container;
    this.options = options;

    this.render();
  }

  private render() {
    const toolbox = document.createElement("div");
    toolbox.className = "toolbox";

    ["circle", "square", "triangle"].forEach(shapeType => {
      const div = document.createElement("div");
      div.className = "shape";
      div.textContent = shapeType;
      div.draggable = true;
      div.dataset.shape = shapeType;

      div.addEventListener("dragstart", e => {
        e.dataTransfer?.setData("shape", shapeType);
      });

      toolbox.appendChild(div);
    });

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset";
    resetBtn.onclick = () => {
      if (this.options.onReset) this.options.onReset();
    };

    toolbox.appendChild(resetBtn);
    this.container.appendChild(toolbox);
  }
}
