// Declare webpack require.context type if needed
declare const require: {
  context: (path: string, deep?: boolean, filter?: RegExp) => {
    keys: () => string[];
    (id: string): any;
  };
};


export function renderHomePage(router: any) {
  const app = document.getElementById("app")!;
  app.innerHTML = "<h5>Select a Puzzle</h5>";

  const puzzleContext = require.context("../puzzles", false, /\.json$/);
  const puzzles = puzzleContext.keys().map((key) => ({
    name: key.replace("./", "").replace(".json", ""),
  }));
  const list = document.createElement("ul");
  puzzles.forEach(({ name }) => {
    console.log("Found puzzle:", name);
    const listItem = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.addEventListener("click", () => {
      router.navigate(`/puzzle/${name}`);
    });
    listItem.appendChild(btn);
    list.appendChild(listItem);
  });
  app.appendChild(list);
}
