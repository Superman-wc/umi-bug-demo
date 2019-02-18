export function isRoot(element) {
  return element.tagName === 'svg';
}

/**
 * 获取答题卡试卷标题元素
 * @param root
 * @returns {Element | SVGElementTagNameMap[string] | HTMLElementTagNameMap[string]}
 */
export function getPageTitleElement(root) {
  return root.querySelector('.page-title');
}

/**
 * 获取答题卡试卷标题文本
 * @param root
 * @returns {*}
 */
export function getPageTitle(root) {
  const element = getPageTitleElement(root);
  if (element) {
    return element.innerHTML;
  }
  return '';
}

/**
 * 创建答题卡试卷标题元素，并加入到文档中
 * @param root
 * @returns {HTMLElement}
 */
export function createPageTitle(root) {
  const pageTitleElement = createElement('text', {
    x: 100,
    y: 50,
    'font-size': 40,
    'class': 'page-title',
    fill: '#000'
  });
  root.appendChild(pageTitleElement);
  return pageTitleElement;
}

/**
 * 创建SVG元素
 * @param tagName
 * @param attributes
 * @returns {HTMLElement | SVGAElement | SVGCircleElement | SVGClipPathElement | SVGComponentTransferFunctionElement | SVGDefsElement | SVGDescElement | SVGEllipseElement | SVGFEBlendElement | SVGFEColorMatrixElement | SVGFEComponentTransferElement | SVGFECompositeElement | SVGFEConvolveMatrixElement | SVGFEDiffuseLightingElement | SVGFEDisplacementMapElement | SVGFEDistantLightElement | SVGFEFloodElement | SVGFEFuncAElement | SVGFEFuncBElement | SVGFEFuncGElement | SVGFEFuncRElement | SVGFEGaussianBlurElement | SVGFEImageElement | SVGFEMergeElement | SVGFEMergeNodeElement | SVGFEMorphologyElement | SVGFEOffsetElement | SVGFEPointLightElement | SVGFESpecularLightingElement | SVGFESpotLightElement | SVGFETileElement | SVGFETurbulenceElement | SVGFilterElement | SVGForeignObjectElement | SVGGElement | SVGImageElement | SVGGradientElement | SVGLineElement | SVGLinearGradientElement | SVGMarkerElement | SVGMaskElement | SVGPathElement | SVGMetadataElement | SVGPatternElement | SVGPolygonElement | SVGPolylineElement | SVGRadialGradientElement | SVGRectElement | SVGSVGElement | SVGScriptElement | SVGStopElement | SVGStyleElement | SVGSwitchElement | SVGSymbolElement | SVGTSpanElement | SVGTextContentElement | SVGTextElement | SVGTextPathElement | SVGTextPositioningElement | SVGTitleElement | SVGUseElement | SVGViewElement | SVGElement | Element}
 */
export function createElement(tagName = 'text', attributes) {
  const ele = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  if (attributes) {
    setAttribute(ele, attributes);
  }
  return ele;
}

/**
 * 设置元素属性
 * @param ele
 * @param attributes
 */
export function setAttribute(ele, attributes) {
  Object.entries(attributes).forEach(([key, value]) => {
    ele.setAttribute(key, value);
  })
}

/**
 * 创建矩形元素
 * @param attributes
 * @returns {HTMLElement|SVGAElement|SVGCircleElement|SVGClipPathElement|SVGComponentTransferFunctionElement|SVGDefsElement|SVGDescElement|SVGEllipseElement|SVGFEBlendElement|SVGFEColorMatrixElement|SVGFEComponentTransferElement|SVGFECompositeElement|SVGFEConvolveMatrixElement|SVGFEDiffuseLightingElement|SVGFEDisplacementMapElement|SVGFEDistantLightElement|SVGFEFloodElement|SVGFEFuncAElement|SVGFEFuncBElement|SVGFEFuncGElement|SVGFEFuncRElement|SVGFEGaussianBlurElement|SVGFEImageElement|SVGFEMergeElement|SVGFEMergeNodeElement|SVGFEMorphologyElement|SVGFEOffsetElement|SVGFEPointLightElement|SVGFESpecularLightingElement|SVGFESpotLightElement|SVGFETileElement|SVGFETurbulenceElement|SVGFilterElement|SVGForeignObjectElement|SVGGElement|SVGImageElement|SVGGradientElement|SVGLineElement|SVGLinearGradientElement|SVGMarkerElement|SVGMaskElement|SVGPathElement|SVGMetadataElement|SVGPatternElement|SVGPolygonElement|SVGPolylineElement|SVGRadialGradientElement|SVGRectElement|SVGSVGElement|SVGScriptElement|SVGStopElement|SVGStyleElement|SVGSwitchElement|SVGSymbolElement|SVGTSpanElement|SVGTextContentElement|SVGTextElement|SVGTextPathElement|SVGTextPositioningElement|SVGTitleElement|SVGUseElement|SVGViewElement|SVGElement|Element}
 */
export function createRectangle(attributes) {
  return createElement('rect', attributes);
}

/**
 * 创建文本元素
 * @param text
 * @param attributes
 * @returns {HTMLElement|SVGAElement|SVGCircleElement|SVGClipPathElement|SVGComponentTransferFunctionElement|SVGDefsElement|SVGDescElement|SVGEllipseElement|SVGFEBlendElement|SVGFEColorMatrixElement|SVGFEComponentTransferElement|SVGFECompositeElement|SVGFEConvolveMatrixElement|SVGFEDiffuseLightingElement|SVGFEDisplacementMapElement|SVGFEDistantLightElement|SVGFEFloodElement|SVGFEFuncAElement|SVGFEFuncBElement|SVGFEFuncGElement|SVGFEFuncRElement|SVGFEGaussianBlurElement|SVGFEImageElement|SVGFEMergeElement|SVGFEMergeNodeElement|SVGFEMorphologyElement|SVGFEOffsetElement|SVGFEPointLightElement|SVGFESpecularLightingElement|SVGFESpotLightElement|SVGFETileElement|SVGFETurbulenceElement|SVGFilterElement|SVGForeignObjectElement|SVGGElement|SVGImageElement|SVGGradientElement|SVGLineElement|SVGLinearGradientElement|SVGMarkerElement|SVGMaskElement|SVGPathElement|SVGMetadataElement|SVGPatternElement|SVGPolygonElement|SVGPolylineElement|SVGRadialGradientElement|SVGRectElement|SVGSVGElement|SVGScriptElement|SVGStopElement|SVGStyleElement|SVGSwitchElement|SVGSymbolElement|SVGTSpanElement|SVGTextContentElement|SVGTextElement|SVGTextPathElement|SVGTextPositioningElement|SVGTitleElement|SVGUseElement|SVGViewElement|SVGElement|Element}
 */
export function createText(text, attributes) {
  const t = createElement('text', attributes);
  t.innerHTML = text;
  return t;
}

export function createGroup(attributes) {
  return createElement('g', attributes);
}


export function createOption(text, attributes = {}) {
  const {x = 0, y = 0} = attributes;
  const group = createGroup({transform: "scale(0.2)", ...attributes});
  const rect = createRectangle({x, y, width: 100, height: 50, stroke: '#000', 'stroke-width': 3, fill: 'none'});
  const t = createText(text, {x: 35 + x, y: 40 + y, 'font-size': 40});
  group.appendChild(rect);
  group.appendChild(t);
  return group;
}

export function createUse(id, attributes) {
  return createElement('use', {href: '#' + id, ...attributes});
}
