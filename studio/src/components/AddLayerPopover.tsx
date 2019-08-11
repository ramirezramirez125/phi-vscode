/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as T from "../types";
import { useRef } from "react";
import Popover from "./Popover";
import { card, row } from "../styles";
import { layerTypeToIcon } from "./LayersTree";
import AddButton from "./AddButton";
import { useToggle } from "../hooks";
import { makeLayer } from "../factories";

type Props = {
  onAdd: (layer: T.Layer) => void;
  disabled: boolean;
  refs: T.Refs;
  root: T.Layer | undefined;
};

export default function AddLayerPopover({
  disabled,
  onAdd,
  refs,
  root
}: Props) {
  const popover = useToggle(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref}>
      <AddButton disabled={disabled} onClick={popover.activate} />
      <Popover
        anchor={ref}
        isOpen={popover.isActive}
        onDismiss={popover.deactivate}
        position="bottom"
      >
        <div css={[card, { margin: "8px 0", width: "240px" }]}>
          <Item
            name="Container"
            onClick={() => onAdd(makeLayer("container", root, refs))}
            icon={layerTypeToIcon("container")}
          />
          <Item
            name="Text"
            onClick={() => onAdd(makeLayer("text", root, refs))}
            icon={layerTypeToIcon("text")}
          />
          <Item
            name="Image"
            onClick={() => onAdd(makeLayer("image", root, refs))}
            icon={layerTypeToIcon("image")}
          />
          <Item
            name="Link"
            onClick={() => onAdd(makeLayer("link", root, refs))}
            icon={layerTypeToIcon("link")}
          />
          {Array.from(refs.components).map(entry => {
            return (
              <Item
                key={entry[0]}
                name={entry[1].name}
                onClick={() =>
                  onAdd(makeLayer("component", root, refs, entry[0]))
                }
                icon={layerTypeToIcon("component")}
              />
            );
          })}
        </div>
      </Popover>
    </div>
  );
}

function Item({
  onClick,
  name,
  icon
}: {
  onClick: () => void;
  name: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      key={name}
      onClick={onClick}
      css={[
        row,
        {
          alignItems: "center",
          padding: "8px 16px",
          border: "none",
          width: "100%",
          fontSize: "14px",
          ":hover": {
            backgroundColor: "#EAEAEA"
          }
        }
      ]}
    >
      {icon}
      <span css={{ marginLeft: "8px" }}>{name}</span>
    </button>
  );
}
