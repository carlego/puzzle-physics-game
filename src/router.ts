import Navigo from "navigo";
import { renderHomePage } from "./pages/HomePage";
import { renderPuzzlePage } from "./pages/PuzzlePage";

const router = new Navigo("/", { hash: true});

router.on("/", () => {
  renderHomePage(router);
});

router.on("/puzzle/:name", (match) => {
   console.log("Navigating to puzzle:", match);
      if (match?.data?.name) {
        renderPuzzlePage(match.data.name);
      }
});

router.resolve();

export { router };
