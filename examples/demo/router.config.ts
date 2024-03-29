import { defineConfig } from "vite-plugin-react-pages-generator";

const routes = [
  {
    path: "/",
    name: "模块1",
    element: "../layouts",
    children: [
      {
        path: "/one1",
        name: "模块12",
        children: [
          {
            path: "/one1/one11",
            name: "one11-new222",
            children: [
              {
                path: "/one1/one11/PageA",
                name: "PageAA",
                element: "PageA",
                lazy: true,
              },
              {
                path: "/one1/one11/PageB",
                name: "PageB",
                element: "PageB",
              },
            ],
          },
          {
            path: "/one1/one12",
            name: "one12",
            children: [
              {
                path: "/one1/one12/PageC",
                name: "PageC",
                element: "PageC",
              },
              {
                path: "/one1/one12/PageD",
                name: "PageD",
                element: "PageD",
              },
            ],
          },
        ],
      },
      {
        path: "/one2",
        name: "模块122",
        children: [
          {
            path: "/one2/PageE",
            name: "PageE",
            element: "PageE",
          },
        ],
      },
    ],
  },
];

// export default routes;

export default defineConfig({
  routes: routes,
});
