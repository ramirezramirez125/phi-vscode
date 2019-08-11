/** @jsx jsx */
import { jsx, InterpolationWithTheme } from "@emotion/core";
import * as T from "../../types";
import { assertUnreachable } from "../../utils";
import { firstEntry } from "../../helpers/immutable-map";
import { getComponentOrThrow } from "../../layerUtils";

type Props = {
  layer: T.Layer;
  refs: T.Refs;
  width: number;
  props: T.ComponentPropertiesValues;
};

function lengthToCss(
  length: T.Length | undefined,
  defaultValue?: string
): string | undefined {
  return length ? lengthToString(length) : defaultValue;
}

function lengthToString(length: T.Length) {
  switch (length.type) {
    case "px":
      return `${length.value}px`;
    default:
      throw new Error("Invalid length type");
  }
}

function colorToString(color: T.Color, colors: T.ColorsMap) {
  switch (color.type) {
    case "ref":
      const ref = colors.get(color.id);
      if (ref == null) {
        throw new Error("Invalid color ref");
      }
      return ref.value;
    case "hex":
      return color.value;
    default:
      throw new Error(`Invalid color ${JSON.stringify(color)}`);
  }
}

function fontSizeToString(
  fontSize: T.Ref | undefined,
  fontSizes: T.FontSizesMap
) {
  if (fontSize === undefined) {
    return undefined;
  }
  const ref = fontSizes.get(fontSize.id);
  if (ref == null) {
    throw new Error("Invalid fontsize ref");
  }
  return ref.value;
}

function fontFamilyToString(
  fontFamily: T.Ref | undefined,
  fontFamilies: T.FontFamiliesMap
): string {
  if (fontFamily == null) {
    return firstEntry(fontFamilies)[1].value;
  }
  const ref = fontFamilies.get(fontFamily.id);
  if (ref == null) {
    throw new Error("Invalid fontsize ref");
  }
  return ref.value;
}

function fontWeightToNumber(
  fontWeight: T.Ref | undefined,
  fontWeights: T.FontWeightsMap
) {
  if (fontWeight == null) {
    return firstEntry(fontWeights)[1].value;
  }
  const ref = fontWeights.get(fontWeight.id);
  if (ref == null) {
    throw new Error("Invalid font weight ref");
  }
  return ref.value;
}

function getLayerStyles(
  defaultStyle: T.LayerStyle,
  mediaQueries: T.MediaQuery[],
  refs: T.Refs,
  width: number
) {
  const styles = mediaQueries
    .map(mq => {
      return {
        minWidth: refs.breakpoints.get(mq.minWidth.id)!.value.value,
        style: mq.style
      };
    })
    .filter(mq => mq.minWidth <= width)
    .sort((a, b) => a.minWidth - b.minWidth)
    .map(mq => mq.style);
  styles.unshift(defaultStyle);
  return styles;
}

function merge<TItem>(array: TItem[]): TItem {
  return array.reduce((previousItem, currentItem) => {
    return {
      ...previousItem,
      ...currentItem
    };
  });
}

function textDecorationToCss(style: T.LayerStyle) {
  if (style.textDecoration == null) {
    return undefined;
  }
  const properties = [];
  if (style.textDecoration.isUnderlined) {
    properties.push("underline");
  }
  if (style.textDecoration.isStrikedThrough) {
    properties.push("line-through");
  }
  if (properties.length === 0) {
    return "none";
  }
  return properties.join(" ");
}

function makeStyleOverrides(style: T.LayerStyle, refs: T.Refs) {
  if (style.overrides == null) {
    return {};
  }
  const result = {} as any;
  for (let override of style.overrides) {
    result[override.pseudoClass] = makeTextLayerStyle(override.style, refs);
  }
  return result;
}

function makeDisplayStyle(style: T.Display) {
  if (style.display === "flex") {
    return {
      display: "flex",
      flexDirection: style.flexDirection,
      flexWrap: style.flexWrap,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,
      alignContent: style.alignContent
    };
  }

  return {
    display: style.display
  };
}

function makeTextLayerStyle(style: T.LayerStyle, refs: T.Refs) {
  return {
    ...makeDisplayStyle(style),
    ...makeDimensionsStyle(style),
    ...makeMarginStyle(style),
    ...makePaddingStyle(style),
    color: style.color ? colorToString(style.color, refs.colors) : undefined,
    backgroundColor: style.backgroundColor
      ? colorToString(style.backgroundColor, refs.colors)
      : undefined,
    opacity: style.opacity != null ? style.opacity : 1,
    borderTopLeftRadius: style.borderTopLeftRadius,
    borderTopRightRadius: style.borderTopRightRadius,
    borderBottomRightRadius: style.borderBottomRightRadius,
    borderBottomLeftRadius: style.borderBottomLeftRadius,
    fontSize: fontSizeToString(style.fontSize, refs.fontSizes),
    fontFamily: fontFamilyToString(style.fontFamily, refs.fontFamilies),
    fontWeight: fontWeightToNumber(style.fontWeight, refs.fontWeights),
    lineHeight: style.lineHeight,
    letterSpacing: lengthToCss(style.letterSpacing, "0"),
    textAlign: style.textAlign,
    textDecoration: textDecorationToCss(style),
    ...makeStyleOverrides(style, refs)
  };
}

function makeLayerStyle(
  layer: T.Layer,
  refs: T.Refs,
  width: number
): InterpolationWithTheme<any> {
  const styles = getLayerStyles(
    layer.style,
    layer.mediaQueries,
    refs,
    width
  ).map(style => makeTextLayerStyle(style, refs));
  return merge(styles);
}

function makeChildren(
  layer: T.Layer,
  refs: T.Refs,
  width: number,
  props: T.ComponentPropertiesValues
) {
  switch (layer.type) {
    case "image":
      return null;
    case "text":
      const textOverride = layer.overrides.find(
        override => override.layerProp === "text"
      );
      return textOverride != null && props[textOverride.propId] != null
        ? props[textOverride.propId]
        : layer.text;
    case "link":
      return layer.children.length > 0
        ? layer.children.map(c => (
            <Layer
              key={c.id}
              layer={c}
              refs={refs}
              width={width}
              props={props}
            />
          ))
        : layer.content;
    case "container":
      return layer.children.map(c => (
        <Layer key={c.id} layer={c} refs={refs} width={width} props={props} />
      ));
    case "component":
      return new Error(
        "Can't create children proprerty for a component layer. This is a bug"
      );
  }
  assertUnreachable(layer);
}

function makeDimensionsStyle(layer: T.Dimensions) {
  return {
    height: layer.height ? layer.height : "auto",
    minHeight: layer.minHeight ? layer.minHeight : "auto",
    maxHeight: layer.maxHeight ? layer.maxHeight : "auto",
    width: layer.width ? layer.width : "auto",
    minWidth: layer.minWidth ? layer.minWidth : "auto",
    maxWidth: layer.maxWidth ? layer.maxWidth : "auto"
  };
}

function makeMarginStyle(layer: T.Margin) {
  return {
    marginTop: layer.marginTop,
    marginRight: layer.marginRight,
    marginBottom: layer.marginBottom,
    marginLeft: layer.marginLeft
  };
}

function makePaddingStyle(layer: T.Padding) {
  return {
    paddingTop: layer.paddingTop,
    paddingRight: layer.paddingRight,
    paddingBottom: layer.paddingBottom,
    paddingLeft: layer.paddingLeft
  };
}

function applyOverrides(
  props: any,
  layer: T.Layer,
  componentProps: T.ComponentPropertiesValues
) {
  for (let override of layer.overrides) {
    const value = componentProps[override.propId];
    if (value != null) {
      props[override.layerProp] = value;
    }
  }
  return props;
}

function makeLayerProps(layer: T.Layer, refs: T.Refs, width: number) {
  const css = makeLayerStyle(layer, refs, width);
  switch (layer.type) {
    case "image":
      return {
        css,
        src: layer.src,
        alt: layer.alt,
        height: layer.height,
        width: layer.width
      };
    case "text":
    case "container":
      return { css };
    case "link":
      return {
        css,
        href: layer.href
      };
    case "component":
      return new Error("TODO. This is a bug");
  }
  assertUnreachable(layer);
}

function Layer({ layer, refs, width, props }: Props) {
  if (layer.type === "component") {
    const component = getComponentOrThrow(layer, refs);
    if (component.layout == null) {
      return null;
    }

    return (
      <Layer
        layer={component.layout}
        refs={refs}
        width={width}
        props={layer.props}
      />
    );
  }
  return jsx(
    layer.tag,
    applyOverrides(makeLayerProps(layer, refs, width), layer, props),
    makeChildren(layer, refs, width, props)
  );
}

export default Layer;
