// Declare webpack require.context type if needed
declare const require: {
  context: (path: string, deep?: boolean, filter?: RegExp) => {
    keys: () => string[];
    (id: string): any;
  };
};


export function renderHomePage(router: any) {
  const app = document.getElementById("app")!;
  app.innerHTML = "<h2>Select a Puzzle</h2>";

  const puzzleContext = require.context("../puzzles", false, /\.json$/);
  const puzzles = puzzleContext.keys().map((key) => ({
    name: key.replace("./", "").replace(".json", ""),
  }));

  puzzles.forEach(({ name }) => {
    console.log("Found puzzle:", name);
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.addEventListener("click", () => {
      router.navigate(`/puzzle/${name}`);
    });
    app.appendChild(btn);
  });
}
