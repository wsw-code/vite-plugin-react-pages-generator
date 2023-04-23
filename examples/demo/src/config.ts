import React from 'react';
import Pre_layouts from '../src/layouts';
import Pre_PageE from '../src/pages/PageE';
const Pre_PageA = React.lazy(() => import("../src/pages/PageA"))
import Pre_PageB from '../src/pages/PageB';
import Pre_PageC from '../src/pages/PageC';
import Pre_PageD from '../src/pages/PageD';


const routeData = [{ "path": "/", "name": "模块1", "element": "../layouts", "children": [{ "path": "/one1", "name": "模块12", "children": [{ "path": "/one1/one11", "name": "one11-new222", "children": [{ "path": "/one1/one11/PageA", "name": "PageAA", "element": "PageA", "lazy": true }, { "path": "/one1/one11/PageB", "name": "PageB", "element": "PageB" }] }, { "path": "/one1/one12", "name": "one12", "children": [{ "path": "/one1/one12/PageC", "name": "PageC", "element": "PageC" }, { "path": "/one1/one12/PageD", "name": "PageD", "element": "PageD" }] }] }, { "path": "/one2", "name": "模块122", "children": [{ "path": "/one2/PageE", "name": "PageE", "element": "PageE" }] }] }]
export const temp = [
  {
    "path": "/", "name": "模块1", 
    "element": React.createElement(Pre_layouts, { routes: routeData[0] }), 
    "children": [{
      "path": "/one1", 
      "name": "模块12", 
      "children": [{
        "path": "/one1/one11", 
        "name": "one11-new222", 
        "children": [
          { 
          "path": "/one1/one11/PageA", 
          "name": "PageAA", 
          // "lazy": true, 
          "element": React.createElement(Pre_PageA)
        },
        { 
          "path": "/one1/one11/PageB", 
          "name": "PageB", 
          "element": React.createElement(Pre_PageB) 
        }
      ]
      },
      { "path": "/one1/one12", "name": "one12", "children": [{ "path": "/one1/one12/PageC", "name": "PageC", "element": React.createElement(Pre_PageC) }, { "path": "/one1/one12/PageD", "name": "PageD", "element": React.createElement(Pre_PageD) }] }]
    }, { "path": "/one2", "name": "模块122", "children": [{ "path": "/one2/PageE", "name": "PageE", "element": React.createElement(Pre_PageE) }] }]
  }]
  ;


