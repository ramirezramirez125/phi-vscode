/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import React, { useState } from "react";
import { column, mainPadding, row, colors } from "../../styles";
import * as T from "../../types";
import { uiStateComponentOrThrow } from "../../refsUtil";
import Component from "./Component";
// import SettingsEditor from "./SettingsEditor";
import CodeExamples from "./CodeExamples";
import LayersTree from "../../components/LayersTree";
import LayerEditor from "./Editors/LayerEditor";
import HtmlEditor from "./Editors/HtmlEditor";
import { Layout } from "../../components/Layout";
import ComponentProps from "./ComponentProps";
import { findLayerByIdWithParent } from "../../layerUtils";
import HtmlLayerBindings from "./Editors/HtmlLayerBindings";
import Button from "../../components/Button";
import ComponentExamplesEditor from "./Editors/ComponentExamplesEditor";
import Toolbar from "./Toolbar";
import { stopKeydownPropagationIfNecessary } from "../../utils";
import TitleMenu from "./TitleMenu";

const tabStyle = css({
  display: "flex",
  flex: "1 1 auto",
  fontSize: "14px",
  justifyContent: "center",
  alignItems: "center",
  border: "none",
  cursor: "pointer",
  color: colors.sideBarForeground,
  background: colors.sideBarBackground,
});

const selectedTabStyle = css(tabStyle, {
  background: colors.sideBarSectionHeaderBackground,
});

type Props = {
  menu: React.ReactNode;
  componentId: string;
  layerId?: string;
  refs: T.Refs;
  applyAction: T.ApplyAction;
};

function ComponentView({
  menu,
  refs,
  applyAction,
  componentId,
  layerId,
}: Props) {
  const component = refs.components.get(componentId)!;
  const uiState = uiStateComponentOrThrow(refs);
  const isCodeVisible = uiState.isCodeVisible;

  const isEditingHTML = uiState.layerEditorMode === "html";

  const { layer: selectedLayer, parent } =
    component.layout && layerId
      ? findLayerByIdWithParent(component.layout, layerId)
      : { layer: undefined, parent: undefined };

  return (
    <Layout
      topBar={
        <div
          css={[
            row,
            {
              alignItems: "center",
              height: "48px",
              background: colors.topBarBackground,
            },
          ]}
        >
          <div css={{ flex: "0", width: "200px", minWidth: "200px" }}>
            {uiState.isEditing && (
              <Toolbar applyAction={applyAction} refs={refs} />
            )}
          </div>
          <div
            css={[
              row,
              {
                flex: "1 1 auto",
                alignItems: "center",
                justifyContent: "center",
                width: "300px",
              },
            ]}
          >
            <div
              css={{
                margin: "0",
                fontWeight: 400,
                fontSize: "18px",
              }}
            >
              {component.name}
            </div>
            <TitleMenu
              refs={refs}
              applyAction={applyAction}
              component={component}
            />
          </div>
          <div css={[row]}>
            <React.Fragment>
              <Button
                text={isCodeVisible ? "Hide code" : "View code"}
                margin="0 12px 0 0"
                onClick={() => {
                  applyAction({
                    type: "toggleCodeVisibility",
                    isVisible: !isCodeVisible,
                  });
                }}
              />
              {uiState.isEditing ? (
                <Button
                  margin="0 12px 0 0"
                  text="Done"
                  onClick={() => applyAction({ type: "stopEditComponent" })}
                />
              ) : (
                <Button
                  text="Edit"
                  margin="0 12px 0 0"
                  onClick={() => {
                    applyAction({
                      type: "editComponent",
                    });
                  }}
                />
              )}
            </React.Fragment>
          </div>
          {/* <SettingsEditor refs={refs} applyAction={applyAction} /> */}
        </div>
      }
      left={
        uiState.isEditing ? (
          <>
            <LayersTree
              layerId={layerId}
              componentId={componentId}
              root={component.layout}
              refs={refs}
              applyAction={applyAction}
            />
            <ComponentProps
              component={component}
              componentId={componentId}
              applyAction={applyAction}
            />
          </>
        ) : (
          menu
        )
      }
      center={
        <div
          css={[
            column,
            { height: "100%", overflowX: "hidden", paddingTop: "48px" },
          ]}
        >
          {isCodeVisible && <CodeExamples component={component} />}
          <div
            css={[
              column,
              mainPadding,
              {
                flex: "1 1 auto",
                overflowX: "auto",
                "::-webkit-scrollbar-corner": {
                  background: "transparent",
                },
              },
            ]}
          >
            <Component
              key={componentId}
              component={component}
              refs={refs}
              applyAction={applyAction}
              selectedLayer={selectedLayer}
            />
          </div>
        </div>
      }
      right={
        uiState.isEditing && selectedLayer ? (
          <div
            onKeyDown={stopKeydownPropagationIfNecessary}
            css={[
              column,
              {
                flexShrink: 0,
                width: "268px",
                minWidth: "268px",
                background: colors.sideBarBackground,
                height: "100%",
              },
            ]}
          >
            <div
              css={[
                row,
                {
                  flex: "0 0 auto",
                  height: "40px",
                  alignItems: "stretch",
                },
              ]}
            >
              <button
                css={isEditingHTML ? selectedTabStyle : tabStyle}
                onClick={() =>
                  applyAction({ type: "setLayerEditorMode", mode: "html" })
                }
              >
                HTML
              </button>
              <button
                css={isEditingHTML ? tabStyle : selectedTabStyle}
                onClick={() =>
                  applyAction({ type: "setLayerEditorMode", mode: "css" })
                }
              >
                CSS
              </button>
            </div>
            {isEditingHTML ? (
              <>
                <HtmlEditor
                  componentId={componentId}
                  component={component}
                  layer={selectedLayer}
                  refs={refs}
                  applyAction={applyAction}
                />
                <HtmlLayerBindings
                  componentId={componentId}
                  component={component}
                  layer={selectedLayer}
                  refs={refs}
                  bindings={selectedLayer.bindings}
                  applyAction={applyAction}
                />
              </>
            ) : (
              <LayerEditor
                layer={selectedLayer}
                parentLayer={parent}
                refs={refs}
                componentId={componentId}
                applyAction={applyAction}
              />
            )}
          </div>
        ) : (
          <div
            css={[
              column,
              {
                flexShrink: 0,
                width: "268px",
                minWidth: "268px",
                background: colors.sideBarBackground,
                height: "100%",
              },
            ]}
          >
            <ComponentExamplesEditor
              component={component}
              componentId={componentId}
              applyAction={applyAction}
            />
          </div>
        )
      }
    />
  );
}

export default ComponentView;
