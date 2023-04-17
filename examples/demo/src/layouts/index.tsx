import React, { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ProLayout, { WaterMark } from "@ant-design/pro-layout";

const transform = (arr: any) => {
  return [arr].map((el) => {
    const { children, ...rest } = el;
    const temp = rest;

    if (children) {
      temp.routes = transform(children);
    }

    return temp;
  });
};

type Props = {
  path: string;
  name: string;
  children?: Props[];
};

const temp = {
  path: "/one1",
  name: "模块1",
  element: "../layouts",
  routes: [
    {
      path: "/one1/two1",
      name: "模块12",
      routes: [
        { path: "/one1/two1/PageA", name: "PageA", element: "PageA" },
        { path: "/one1/two1/PageB", name: "PageB", element: "PageB" },
      ],
    },
    {
      path: "/one1/two12",
      name: "模块122",
      routes: [
        { path: "/one1/two12/PageA", name: "PageA", element: "PageA" },
        { path: "/one1/two12/PageB", name: "PageB", element: "PageB" },
      ],
    },
  ],
};

export default ({ routes }: any) => {
  const [pathname, setPathName] = useState("/one1/two12/PageA");

  const location = useLocation();

  const navigate = useNavigate();

  console.log(routes);
  console.log("pathname", pathname);

  return (
    <div>
      <div>我是layouts组件</div>

      <ProLayout
        splitMenus
        layout="mix"
        navTheme="light"
        fixSiderbar
        headerTitleRender={() => {
          // console.log(logo);
          return <div>Logo</div>;
        }}
        menuItemRender={(item, dom) => {
          return (
            <div
              onClick={() => {
                console.log(item);
                if (item.path) {
                  console.log(item.path);
                  navigate(item.path);
                }
              }}
            >
              {dom}
            </div>
          );
        }}
        title={""}
        route={routes}
      >
        <Outlet />
      </ProLayout>
    </div>
  );
};
