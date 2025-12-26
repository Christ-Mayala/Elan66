import React from 'react';

const booleanPropNames = new Set([
  'accessible',
  'adjustsFontSizeToFit',
  'allowFontScaling',
  'animated',
  'autoCapitalize',
  'autoCorrect',
  'autoFocus',
  'blurOnSubmit',
  'collapsable',
  'disabled',
  'editable',
  'focusable',
  'horizontal',
  'invertStickyHeaders',
  'keyboardDismissOnDrag',
  'multiline',
  'pagingEnabled',
  'removeClippedSubviews',
  'scrollEnabled',
  'secureTextEntry',
  'selectable',
  'showsHorizontalScrollIndicator',
  'showsVerticalScrollIndicator',
  'snapToAlignment',
  'stickyHeaderHiddenOnScroll',
  'textBreakStrategy',
  'transparent',
  'visible',
]);

const isStringBool = (v) => v === 'true' || v === 'false';

export const installDevBooleanPropsGuard = () => {
  if (!__DEV__) return;
  if (global.__ELAN66_BOOL_GUARD_INSTALLED__) return;
  global.__ELAN66_BOOL_GUARD_INSTALLED__ = true;

  const prevCreateElement = React.createElement;

  React.createElement = function patchedCreateElement(type, props, ...children) {
    if (props) {
      for (const k of Object.keys(props)) {
        if (!booleanPropNames.has(k)) continue;
        const v = props[k];
        if (typeof v === 'string' && isStringBool(v)) {
          const name = typeof type === 'string' ? type : type?.displayName || type?.name || 'Component';
          throw new Error(`[ELAN66] Boolean prop must not be a string: ${name}.${k}="${v}"`);
        }
      }
    }

    return prevCreateElement(type, props, ...children);
  };
};
