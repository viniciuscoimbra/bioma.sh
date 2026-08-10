import { jsxs as r, Fragment as He, jsx as e } from "react/jsx-runtime";
import { forwardRef as te, useState as S, Children as Qn, isValidElement as Nn, cloneElement as $n, useId as be, useRef as Y, useEffect as J, useLayoutEffect as oa, useMemo as fe, useCallback as Ft, useContext as Un, createContext as Vn } from "react";
import { createPortal as ca } from "react-dom";
import { max as bn } from "d3-array";
import { scaleLinear as tn } from "d3-scale";
import { arc as la, line as Gn, curveMonotoneX as gn, area as ia } from "d3-shape";
function g(...n) {
  const t = [];
  for (const s of n)
    if (s) {
      if (typeof s == "string" || typeof s == "number")
        t.push(String(s));
      else if (typeof s == "object")
        for (const a in s)
          s[a] && t.push(a);
    }
  return t.join(" ");
}
const da = "_btn_1713m_1", _a = "_md_1713m_29", ua = "_sm_1713m_34", ma = "_block_1713m_39", ha = "_primary_1713m_44", pa = "_secondary_1713m_58", fa = "_ghost_1713m_71", ba = "_danger_1713m_83", ga = "_icon_1713m_97", va = "_label_1713m_106", ya = "_loading_1713m_114", ka = "_success_1713m_120", Na = "_error_1713m_121", $a = "_feedbackIcon_1713m_122", wa = "_progress_1713m_123", xa = "_progressAlt_1713m_124", Ca = "_spinner_1713m_125", je = {
  btn: da,
  md: _a,
  sm: ua,
  block: ma,
  primary: ha,
  secondary: pa,
  ghost: fa,
  danger: ba,
  icon: ga,
  label: va,
  loading: ya,
  success: ka,
  error: Na,
  feedbackIcon: $a,
  progress: wa,
  progressAlt: xa,
  spinner: Ca,
  "btn-spin": "_btn-spin_1713m_1",
  "effect-fill-horizontal": "_effect-fill-horizontal_1713m_142",
  "btn-fill-x": "_btn-fill-x_1713m_1",
  "effect-fill-vertical": "_effect-fill-vertical_1713m_143",
  "btn-fill-y": "_btn-fill-y_1713m_1",
  "effect-shrink-horizontal": "_effect-shrink-horizontal_1713m_148",
  "btn-shrink-x": "_btn-shrink-x_1713m_1",
  "effect-shrink-vertical": "_effect-shrink-vertical_1713m_149",
  "btn-shrink-y": "_btn-shrink-y_1713m_1",
  "btn-line-x": "_btn-line-x_1713m_1",
  "btn-line-y": "_btn-line-y_1713m_1",
  "effect-rotate-angle-bottom": "_effect-rotate-angle-bottom_1713m_172",
  "btn-rab": "_btn-rab_1713m_1",
  "effect-rotate-angle-top": "_effect-rotate-angle-top_1713m_173",
  "btn-rat": "_btn-rat_1713m_1",
  "effect-rotate-angle-left": "_effect-rotate-angle-left_1713m_174",
  "btn-ral": "_btn-ral_1713m_1",
  "effect-rotate-angle-right": "_effect-rotate-angle-right_1713m_175",
  "btn-rar": "_btn-rar_1713m_1",
  "effect-rotate-side-down": "_effect-rotate-side-down_1713m_192",
  "btn-rsd": "_btn-rsd_1713m_1",
  "effect-rotate-side-up": "_effect-rotate-side-up_1713m_193",
  "btn-rsu": "_btn-rsu_1713m_1",
  "effect-rotate-side-left": "_effect-rotate-side-left_1713m_194",
  "btn-rsl": "_btn-rsl_1713m_1",
  "effect-rotate-side-right": "_effect-rotate-side-right_1713m_195",
  "btn-rsr": "_btn-rsr_1713m_1",
  "effect-rotate-back": "_effect-rotate-back_1713m_216",
  "btn-rotate-back": "_btn-rotate-back_1713m_1",
  "effect-flip-open": "_effect-flip-open_1713m_241",
  "btn-flip-open": "_btn-flip-open_1713m_1",
  "effect-slide-down": "_effect-slide-down_1713m_244",
  "btn-slide-label": "_btn-slide-label_1713m_1",
  "btn-slide-load": "_btn-slide-load_1713m_1",
  "effect-move-up": "_effect-move-up_1713m_251",
  "btn-move-up": "_btn-move-up_1713m_1",
  "effect-top-line": "_effect-top-line_1713m_254",
  "effect-lateral-lines": "_effect-lateral-lines_1713m_256"
}, oe = te(function({
  variant: t = "secondary",
  size: s = "md",
  leadingIcon: a,
  trailingIcon: o,
  loading: c = !1,
  status: i = "idle",
  progressEffect: _ = "spinner",
  loadingLabel: f,
  block: l = !1,
  disabled: d,
  className: u,
  children: m,
  ...b
}, p) {
  const h = c ? "loading" : i, v = h === "loading", k = h === "success" || h === "error";
  return /* @__PURE__ */ r(
    "button",
    {
      ref: p,
      className: g(
        je.btn,
        je[t],
        je[s],
        l && je.block,
        je[h],
        v && je[`effect-${_}`],
        u
      ),
      disabled: d || v,
      "aria-busy": v || void 0,
      "data-status": h,
      ...b,
      children: [
        v && _ !== "spinner" && /* @__PURE__ */ r(He, { children: [
          /* @__PURE__ */ e("span", { className: je.progress, "aria-hidden": "true" }),
          /* @__PURE__ */ e("span", { className: je.progressAlt, "aria-hidden": "true" })
        ] }),
        v && _ === "spinner" && /* @__PURE__ */ e("span", { className: je.spinner, "aria-hidden": "true" }),
        !v && !k && a && /* @__PURE__ */ e("span", { className: je.icon, children: a }),
        k && /* @__PURE__ */ e("span", { className: je.feedbackIcon, "aria-hidden": "true", children: h === "success" ? "✓" : "×" }),
        m && /* @__PURE__ */ e("span", { className: je.label, children: v ? f ?? m : m }),
        !v && !k && o && /* @__PURE__ */ e("span", { className: je.icon, children: o })
      ]
    }
  );
}), La = "_googleButton_19vn8_1", za = {
  googleButton: La
};
function Ma() {
  return /* @__PURE__ */ r("svg", { viewBox: "0 0 18 18", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ e("path", { fill: "#4285F4", d: "M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" }),
    /* @__PURE__ */ e("path", { fill: "#34A853", d: "M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" }),
    /* @__PURE__ */ e("path", { fill: "#FBBC05", d: "M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33Z" }),
    /* @__PURE__ */ e("path", { fill: "#EA4335", d: "M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" })
  ] });
}
const Cv = te(function({ children: t = "Continuar com Google", className: s, ...a }, o) {
  return /* @__PURE__ */ e(
    oe,
    {
      ref: o,
      variant: "secondary",
      leadingIcon: /* @__PURE__ */ e(Ma, {}),
      className: g(za.googleButton, s),
      ...a,
      children: t
    }
  );
}), Da = "_group_e0qsr_1", Ia = "_horizontal_e0qsr_16", ja = "_vertical_e0qsr_21", wn = {
  group: Da,
  horizontal: Ia,
  vertical: ja
};
function Lv({ orientation: n = "horizontal", label: t, defaultActiveIndex: s = 0, activeIndex: a, onActiveIndexChange: o, className: c, children: i, ..._ }) {
  const [f, l] = S(s), d = a ?? f, u = Qn.map(i, (m, b) => {
    if (!Nn(m)) return m;
    const p = m, h = b === d;
    return $n(p, {
      "aria-pressed": h,
      variant: h ? "primary" : "secondary",
      onClick: (v) => {
        var k, y;
        p.props.disabled || (a === void 0 && l(b), o == null || o(b)), (y = (k = p.props).onClick) == null || y.call(k, v);
      }
    });
  });
  return /* @__PURE__ */ e(
    "div",
    {
      role: "group",
      "aria-label": t,
      "aria-orientation": n,
      className: g(wn.group, wn[n], c),
      ..._,
      children: u
    }
  );
}
const Ea = "_logo_ssnx5_1", Ba = "_refy_ssnx5_11", Aa = "_domuz_ssnx5_16", Sa = "_inverse_ssnx5_20", Ra = "_word_ssnx5_21", Ta = "_domuzLockup_ssnx5_23", qa = "_domuzMark_ssnx5_24", Oa = "_markOnly_ssnx5_38", Wa = "_monogram_ssnx5_39", Pa = "_dot_ssnx5_53", Fa = "_xs_ssnx5_62", Ha = "_sm_ssnx5_64", Qa = "_md_ssnx5_66", Ua = "_lg_ssnx5_68", Va = "_xl_ssnx5_70", we = {
  logo: Ea,
  refy: Ba,
  domuz: Aa,
  inverse: Sa,
  word: Ra,
  domuzLockup: Ta,
  domuzMark: qa,
  markOnly: Oa,
  monogram: Wa,
  dot: Pa,
  "brand-logo-pulse": "_brand-logo-pulse_ssnx5_1",
  xs: Fa,
  sm: Ha,
  md: Qa,
  lg: Ua,
  xl: Va,
  static: "_static_ssnx5_73"
}, sn = {
  width: 702,
  height: 675,
  path: "M 105.500 2.090 C 91.606 3.349, 78.050 7.277, 64.500 13.969 C 50.399 20.934, 38.641 29.944, 28.866 41.277 C 25.177 45.554, 20.036 52.675, 17.441 57.100 C 11.895 66.560, 5.887 81.455, 3.363 92 C 1.668 99.082, 1.549 112.486, 1.234 332.500 C 1.010 488.681, 1.241 568.467, 1.935 574.500 C 2.504 579.450, 3.673 586.200, 4.534 589.500 C 6.944 598.741, 12.032 610.646, 17.520 619.883 C 23.322 629.649, 37.066 644.647, 46.778 651.810 C 54.342 657.388, 66.424 663.665, 75.728 666.850 C 91.103 672.113, 87.177 672.001, 255.381 671.991 C 352.610 671.986, 415.838 671.600, 423 670.969 C 454.234 668.214, 485.409 660.224, 514.439 647.534 C 560.846 627.246, 600.938 595.279, 632.633 553.294 C 641.548 541.485, 655.201 519.522, 661.860 506.279 C 672.237 485.640, 682.793 456.813, 688.419 433.747 C 693.356 413.508, 696.232 394.935, 697.976 372.050 C 699.296 354.719, 699.289 319.889, 697.963 303.395 C 696.680 287.433, 693.650 266.995, 690.418 252.500 C 684.532 226.102, 674.080 196.962, 661.791 172.688 C 654.009 157.318, 640.605 136.667, 628.565 121.497 C 611.370 99.835, 583.745 74.259, 561.316 59.236 C 537.007 42.953, 509.852 29.401, 484 20.649 C 452.977 10.146, 421.656 4.170, 386.500 2.046 C 366.331 0.828, 119.009 0.867, 105.500 2.090 M 102.618 67.112 C 100.484 67.613, 95.759 69.439, 92.118 71.169 C 87.597 73.319, 83.248 76.562, 78.391 81.408 C 71.136 88.646, 67.668 94.230, 64.362 104 C 62.571 109.290, 62.489 118.198, 62.211 337 C 62.006 498.604, 62.240 566.357, 63.018 570.910 C 64.262 578.187, 66.062 582.242, 69.864 586.342 C 75.894 592.842, 85.501 594.835, 92.790 591.097 C 97.483 588.690, 100.420 585.546, 102.702 580.486 C 104.372 576.784, 104.539 570.519, 105.041 492.500 C 105.568 410.599, 105.635 408.334, 107.691 401.852 C 110.576 392.758, 115.280 383.155, 119.759 377.216 C 123.549 372.189, 189.996 302.859, 214.925 277.920 C 223.185 269.657, 230.653 263.134, 234 261.260 C 242.175 256.680, 251.462 253.956, 261 253.338 C 266.974 252.951, 271.500 253.259, 276.230 254.375 C 284.903 256.420, 294.169 260.687, 300.609 265.602 C 303.418 267.746, 310.831 275.075, 317.082 281.888 L 328.446 294.276 335.895 286.388 C 339.992 282.050, 358.512 262.075, 377.052 242 C 395.591 221.925, 412.815 204.027, 415.327 202.226 C 417.839 200.425, 423.194 197.385, 427.226 195.470 C 440.993 188.932, 456.227 187.364, 470.590 191.006 C 480.191 193.440, 488.505 197.406, 496.500 203.362 C 499.800 205.821, 508.513 214.652, 515.861 222.987 C 527.678 236.389, 563.798 276.724, 620.365 339.684 C 637.407 358.652, 638.538 359.707, 639.132 357.184 C 639.479 355.708, 639.806 347.750, 639.859 339.500 C 640.117 299.091, 633.642 261.633, 620.497 227.482 C 615.629 214.835, 610.029 203.367, 602.439 190.500 C 595.608 178.920, 590.019 171.065, 579.875 158.789 C 563.581 139.071, 539.837 119.076, 515.787 104.822 C 494.583 92.254, 466.604 80.801, 442 74.616 C 429.735 71.533, 410.417 68.308, 396.500 67.020 C 382.544 65.728, 108.146 65.814, 102.618 67.112 M 452.500 246.712 C 445.903 248.032, 447.318 246.635, 386.186 312.210 L 365.946 333.920 380.723 349.586 C 411.067 381.755, 414.875 386.187, 419.035 394.183 C 421.250 398.442, 424.043 405.431, 425.241 409.713 C 427.380 417.360, 427.425 418.928, 427.765 496.937 C 427.979 546.040, 427.724 580.217, 427.097 586.437 C 426.539 591.972, 425 600.235, 423.677 604.800 L 421.271 613.099 423.886 612.584 C 425.324 612.300, 428.300 611.784, 430.500 611.437 C 437.226 610.375, 461.085 604.240, 468.500 601.665 C 490.098 594.166, 509.141 584.725, 528.233 572.052 C 551.781 556.421, 570.801 538.392, 588.308 515.107 C 602.123 496.732, 611.988 477.949, 617.686 459.170 C 619.824 452.122, 620.311 448.535, 620.286 440 C 620.262 432.030, 619.767 428.149, 618.231 423.894 C 614.483 413.515, 616.997 416.523, 556.012 349.434 C 523.318 313.467, 478.756 264.128, 472.417 256.875 C 469.712 253.782, 465.925 250.354, 464 249.257 C 460.192 247.087, 455.648 246.082, 452.500 246.712 M 258.860 311.776 C 256.564 312.863, 239.940 329.368, 213.860 356.452 C 191.112 380.076, 170.335 401.768, 167.690 404.658 C 164.813 407.801, 161.999 412.241, 160.690 415.706 C 158.519 421.450, 158.495 422.205, 157.968 503.500 C 157.441 584.875, 157.420 585.556, 155.193 592.829 C 153.959 596.859, 151.604 602.822, 149.960 606.079 L 146.971 612 245.304 612 C 353.851 612, 349.020 612.271, 358.657 605.651 C 361.321 603.822, 364.925 600.467, 366.666 598.195 C 368.407 595.923, 370.746 591.622, 371.863 588.636 C 373.835 583.367, 373.899 580.936, 374.062 505.854 C 374.182 450.379, 373.906 427.369, 373.087 424.500 C 372.458 422.300, 371.169 419.071, 370.222 417.325 C 368.352 413.876, 348.909 392.694, 309 350.623 C 294.975 335.839, 281.499 321.488, 279.052 318.734 C 274.657 313.784, 268.383 310.040, 264.500 310.048 C 263.400 310.051, 260.862 310.828, 258.860 311.776"
}, xn = "M 102.618 67.112 C 100.484 67.613, 95.759 69.439, 92.118 71.169 C 87.597 73.319, 83.248 76.562, 78.391 81.408 C 71.136 88.646, 67.668 94.230, 64.362 104 C 62.571 109.290, 62.489 118.198, 62.211 337 C 62.006 498.604, 62.240 566.357, 63.018 570.910 C 64.262 578.187, 66.062 582.242, 69.864 586.342 C 75.894 592.842, 85.501 594.835, 92.790 591.097 C 97.483 588.690, 100.420 585.546, 102.702 580.486 C 104.372 576.784, 104.539 570.519, 105.041 492.500 C 105.568 410.599, 105.635 408.334, 107.691 401.852 C 110.576 392.758, 115.280 383.155, 119.759 377.216 C 123.549 372.189, 189.996 302.859, 214.925 277.920 C 223.185 269.657, 230.653 263.134, 234 261.260 C 242.175 256.680, 251.462 253.956, 261 253.338 C 266.974 252.951, 271.500 253.259, 276.230 254.375 C 284.903 256.420, 294.169 260.687, 300.609 265.602 C 303.418 267.746, 310.831 275.075, 317.082 281.888 L 328.446 294.276 335.895 286.388 C 339.992 282.050, 358.512 262.075, 377.052 242 C 395.591 221.925, 412.815 204.027, 415.327 202.226 C 417.839 200.425, 423.194 197.385, 427.226 195.470 C 440.993 188.932, 456.227 187.364, 470.590 191.006 C 480.191 193.440, 488.505 197.406, 496.500 203.362 C 499.800 205.821, 508.513 214.652, 515.861 222.987 C 527.678 236.389, 563.798 276.724, 620.365 339.684 C 637.407 358.652, 638.538 359.707, 639.132 357.184 C 639.479 355.708, 639.806 347.750, 639.859 339.500 C 640.117 299.091, 633.642 261.633, 620.497 227.482 C 615.629 214.835, 610.029 203.367, 602.439 190.500 C 595.608 178.920, 590.019 171.065, 579.875 158.789 C 563.581 139.071, 539.837 119.076, 515.787 104.822 C 494.583 92.254, 466.604 80.801, 442 74.616 C 429.735 71.533, 410.417 68.308, 396.500 67.020 C 382.544 65.728, 108.146 65.814, 102.618 67.112  M 452.500 246.712 C 445.903 248.032, 447.318 246.635, 386.186 312.210 L 365.946 333.920 380.723 349.586 C 411.067 381.755, 414.875 386.187, 419.035 394.183 C 421.250 398.442, 424.043 405.431, 425.241 409.713 C 427.380 417.360, 427.425 418.928, 427.765 496.937 C 427.979 546.040, 427.724 580.217, 427.097 586.437 C 426.539 591.972, 425 600.235, 423.677 604.800 L 421.271 613.099 423.886 612.584 C 425.324 612.300, 428.300 611.784, 430.500 611.437 C 437.226 610.375, 461.085 604.240, 468.500 601.665 C 490.098 594.166, 509.141 584.725, 528.233 572.052 C 551.781 556.421, 570.801 538.392, 588.308 515.107 C 602.123 496.732, 611.988 477.949, 617.686 459.170 C 619.824 452.122, 620.311 448.535, 620.286 440 C 620.262 432.030, 619.767 428.149, 618.231 423.894 C 614.483 413.515, 616.997 416.523, 556.012 349.434 C 523.318 313.467, 478.756 264.128, 472.417 256.875 C 469.712 253.782, 465.925 250.354, 464 249.257 C 460.192 247.087, 455.648 246.082, 452.500 246.712  M 258.860 311.776 C 256.564 312.863, 239.940 329.368, 213.860 356.452 C 191.112 380.076, 170.335 401.768, 167.690 404.658 C 164.813 407.801, 161.999 412.241, 160.690 415.706 C 158.519 421.450, 158.495 422.205, 157.968 503.500 C 157.441 584.875, 157.420 585.556, 155.193 592.829 C 153.959 596.859, 151.604 602.822, 149.960 606.079 L 146.971 612 245.304 612 C 353.851 612, 349.020 612.271, 358.657 605.651 C 361.321 603.822, 364.925 600.467, 366.666 598.195 C 368.407 595.923, 370.746 591.622, 371.863 588.636 C 373.835 583.367, 373.899 580.936, 374.062 505.854 C 374.182 450.379, 373.906 427.369, 373.087 424.500 C 372.458 422.300, 371.169 419.071, 370.222 417.325 C 368.352 413.876, 348.909 392.694, 309 350.623 C 294.975 335.839, 281.499 321.488, 279.052 318.734 C 274.657 313.784, 268.383 310.040, 264.500 310.048 C 263.400 310.051, 260.862 310.828, 258.860 311.776", Cn = {
  path: "M218.16 715.68L218.16 715.68Q136.80 715.68 81 660.60Q25.20 605.52 25.20 527.76L25.20 527.76Q25.20 444.24 77.40 391.68Q129.60 339.12 212.40 339.12L212.40 339.12Q267.12 339.12 308.88 372.96L308.88 372.96L309.60 185.04L411.84 185.04L411.84 527.76Q411.84 609.12 356.76 662.40Q301.68 715.68 218.16 715.68ZM153.36 592.56Q179.28 619.20 218.16 619.20Q257.04 619.20 283.32 592.56Q309.60 565.92 309.60 527.76Q309.60 489.60 283.32 462.60Q257.04 435.60 218.16 435.60Q179.28 435.60 153.36 462.60Q127.44 489.60 127.44 527.76Q127.44 565.92 153.36 592.56ZM784.80 659.88Q728.64 714.96 647.28 714.96Q565.92 714.96 510.12 659.88Q454.32 604.80 454.32 526.32L454.32 526.32Q454.32 448.56 510.12 393.48Q565.92 338.40 647.28 338.40L647.28 338.40Q729.36 338.40 785.16 393.48Q840.96 448.56 840.96 526.32L840.96 526.32Q840.96 604.80 784.80 659.88ZM582.48 592.20Q608.40 619.20 647.28 619.20Q686.16 619.20 712.44 592.20Q738.72 565.20 738.72 527.04Q738.72 488.88 712.44 461.88Q686.16 434.88 647.28 434.88Q608.40 434.88 582.48 461.88Q556.56 488.88 556.56 527.04Q556.56 565.20 582.48 592.20ZM1332.72 336.24L1332.72 336.24Q1416.24 336.24 1461.96 388.44Q1507.68 440.64 1507.68 519.12L1507.68 519.12L1507.68 705.60L1405.44 705.60L1405.44 536.40Q1405.44 492.48 1385.28 464.04Q1365.12 435.60 1325.52 435.60Q1285.92 435.60 1266.12 463.68Q1246.32 491.76 1246.32 534.96L1246.32 534.96L1246.32 705.60L1144.08 705.60L1144.08 535.68Q1144.08 491.76 1124.28 463.68Q1104.48 435.60 1064.88 435.60L1064.88 435.60Q1024.56 435.60 1005.12 463.68Q985.68 491.76 985.68 535.68L985.68 535.68L985.68 705.60L883.44 705.60L883.44 519.12Q883.44 440.64 928.80 388.44Q974.16 336.24 1056.96 336.24L1056.96 336.24Q1107.36 336.24 1143.72 357.12Q1180.08 378.00 1195.92 415.44L1195.92 415.44Q1212.48 378.72 1248.84 357.48Q1285.20 336.24 1332.72 336.24ZM1685.88 587.16Q1706.40 616.32 1743.84 616.32Q1781.28 616.32 1802.16 587.16Q1823.04 558 1823.04 514.08L1823.04 514.08L1823.04 349.20L1925.28 349.20L1925.28 526.32Q1925.28 608.40 1877.76 661.68Q1830.24 714.96 1743.84 714.96L1743.84 714.96Q1658.16 714.96 1610.64 661.68Q1563.12 608.40 1563.12 526.32L1563.12 526.32L1563.12 349.20L1665.36 349.20L1665.36 514.80Q1665.36 558 1685.88 587.16ZM2286.72 619.20L2286.72 705.60L2059.20 705.60Q2016.72 705.60 1993.32 684.72Q1969.92 663.84 1969.20 632.88L1969.20 632.88Q1968.48 584.64 2012.40 555.84L2012.40 555.84L2180.88 443.52Q2183.76 442.08 2183.76 439.20L2183.76 439.20Q2183.76 435.60 2178.72 435.60L2178.72 435.60L1980.72 435.60L1980.72 349.20L2200.32 349.20Q2242.80 349.20 2266.56 370.08Q2290.32 390.96 2290.32 421.92L2290.32 421.92Q2291.04 470.16 2247.12 498.96L2247.12 498.96L2078.64 611.28Q2075.76 613.44 2075.76 617.04L2075.76 617.04Q2075.76 619.20 2080.08 619.20L2080.08 619.20L2286.72 619.20Z"
}, Et = {
  width: 3445.6,
  height: 1e3,
  symbolScale: 1.481481,
  symbolY: 0,
  wordmarkX: 1180,
  wordmarkY: 234.68
}, pt = {
  size: 1e3,
  symbolScale: 1.082621,
  symbolX: 120,
  symbolY: 134.615
}, Ht = {
  width: 3031.475,
  height: 1e3,
  symbolShiftX: -187.129,
  wordmarkX: 765.875,
  wordmarkY: 234.68
};
function Kn({
  brand: n = "refy",
  size: t = "sm",
  tone: s = "default",
  mode: a = "solid",
  variant: o,
  animated: c = !0,
  markOnly: i = !1,
  className: _,
  ...f
}) {
  const l = n === "domuz" || n === "dommus", d = l ? "Domuz.app" : "refy.", u = be().replace(/:/g, ""), m = Ga(o ?? (s === "inverse" ? "white" : "theme")), b = Ln(m) ? `url(#domuz-${u})` : void 0, p = m === "theme" || Ln(m) ? `url(#domuz-${u})` : void 0, h = b ?? zn(m, "symbol"), v = b ?? zn(m, "wordmark"), k = p ?? Mn(m, "symbol"), y = p ?? Mn(m, "wordmark");
  return /* @__PURE__ */ r(
    "span",
    {
      role: "img",
      "aria-label": d,
      className: g(we.logo, l ? we.domuz : we.refy, we[t], we[s], i && we.markOnly, !c && we.static, _),
      ...f,
      children: [
        l && i && a === "line" && /* @__PURE__ */ r("svg", { "aria-hidden": "true", className: we.domuzMark, viewBox: `0 0 ${sn.width} ${sn.height}`, children: [
          /* @__PURE__ */ e(rn, { id: `domuz-${u}`, variant: m }),
          /* @__PURE__ */ e("path", { fill: h, fillRule: "evenodd", d: sn.path })
        ] }),
        l && i && a === "solid" && /* @__PURE__ */ r("svg", { "aria-hidden": "true", className: we.domuzMark, viewBox: `0 0 ${pt.size} ${pt.size}`, children: [
          /* @__PURE__ */ e(rn, { id: `domuz-${u}`, variant: m }),
          /* @__PURE__ */ e("g", { transform: `translate(${pt.symbolX} ${pt.symbolY}) scale(${pt.symbolScale})`, children: /* @__PURE__ */ e("path", { fill: k, fillRule: "evenodd", d: xn }) })
        ] }),
        l && !i && a === "line" && /* @__PURE__ */ r("svg", { "aria-hidden": "true", className: we.domuzLockup, viewBox: `0 0 ${Et.width} ${Et.height}`, children: [
          /* @__PURE__ */ e(rn, { id: `domuz-${u}`, variant: m }),
          /* @__PURE__ */ e("path", { fill: h, fillRule: "evenodd", d: sn.path, transform: `translate(0 ${Et.symbolY}) scale(${Et.symbolScale})` }),
          /* @__PURE__ */ e("path", { fill: v, d: Cn.path, transform: `translate(${Et.wordmarkX} ${Et.wordmarkY}) translate(${-25.2} ${-185.04})` })
        ] }),
        l && !i && a === "solid" && /* @__PURE__ */ r("svg", { "aria-hidden": "true", className: we.domuzLockup, viewBox: `0 0 ${Ht.width} ${Ht.height}`, children: [
          /* @__PURE__ */ e(rn, { id: `domuz-${u}`, variant: m }),
          /* @__PURE__ */ e("g", { transform: `translate(${Ht.symbolShiftX} 0)`, children: /* @__PURE__ */ e("g", { transform: `translate(${pt.symbolX} ${pt.symbolY}) scale(${pt.symbolScale})`, children: /* @__PURE__ */ e("path", { fill: k, fillRule: "evenodd", d: xn }) }) }),
          /* @__PURE__ */ e("path", { fill: y, d: Cn.path, transform: `translate(${Ht.wordmarkX} ${Ht.wordmarkY}) translate(${-25.2} ${-185.04})` })
        ] }),
        !l && (i ? /* @__PURE__ */ e("span", { "aria-hidden": "true", className: we.monogram, children: "r" }) : /* @__PURE__ */ e("span", { "aria-hidden": "true", className: we.word, children: d })),
        !l && !i && /* @__PURE__ */ e("span", { "aria-hidden": "true", className: we.dot })
      ]
    }
  );
}
function Ga(n) {
  return n === "default" || n === "theme" ? "theme" : n === "black" ? "mono" : n === "white" ? "inverse" : n;
}
function Ln(n) {
  return n === "pride" || n === "trans" || n === "copa";
}
function zn(n, t) {
  return n === "inverse" ? "var(--brand-logo-line-white, var(--brand-logo-inverse, var(--legacy-white)))" : n === "orange" ? "var(--brand-logo-orange, var(--brand-primary-container))" : n === "mono" ? "var(--brand-logo-line-black, var(--brand-logo-mono, var(--ink-1)))" : t === "symbol" ? "var(--brand-logo-line-theme, var(--brand-logo-symbol, var(--brand-primary-container)))" : "var(--brand-logo-wordmark, var(--ink-1))";
}
function Mn(n, t) {
  return n === "inverse" ? "var(--brand-logo-solid-white, var(--brand-logo-inverse, var(--legacy-white)))" : n === "mono" ? "var(--brand-logo-solid-black, var(--brand-logo-mono, var(--ink-1)))" : n === "orange" ? "var(--brand-logo-orange, var(--brand-primary-container))" : t === "wordmark" ? "var(--brand-logo-solid-wordmark, var(--brand-logo-solid-theme, var(--brand-logo-wordmark, var(--ink-1))))" : "var(--brand-logo-solid-theme, var(--brand-logo-symbol, var(--brand-primary-container)))";
}
function rn({ id: n, variant: t }) {
  const s = t === "theme" ? Ka : t === "pride" ? Xa : t === "trans" ? Za : t === "copa" ? Ya : null;
  return s ? /* @__PURE__ */ e("defs", { children: /* @__PURE__ */ e("linearGradient", { id: n, x1: "0", y1: "0", x2: "1", y2: "1", children: s.map(([a, o]) => /* @__PURE__ */ e("stop", { offset: a, stopColor: o }, a)) }) }) : null;
}
const Ka = [
  ["0%", "var(--brand-logo-solid-theme-start, #ff8a32)"],
  ["56%", "var(--brand-logo-solid-theme, #f15a24)"],
  ["100%", "var(--brand-logo-solid-theme-end, #c94322)"]
], Xa = [
  ["0%", "var(--brand-pride-red, #e62418)"],
  ["18%", "var(--brand-pride-orange, #ff7a00)"],
  ["36%", "var(--brand-pride-yellow, #ffd400)"],
  ["54%", "var(--brand-pride-green, #008a3d)"],
  ["72%", "var(--brand-pride-blue, #0057b8)"],
  ["90%", "var(--brand-pride-purple, #7a1fa2)"],
  ["100%", "var(--brand-pride-pink, #f43f7a)"]
], Za = [
  ["0%", "var(--brand-trans-blue, #6ec6ea)"],
  ["34%", "var(--brand-trans-pink, #f7a8b8)"],
  ["50%", "var(--brand-trans-white, #fff8f5)"],
  ["66%", "var(--brand-trans-pink, #f7a8b8)"],
  ["100%", "var(--brand-trans-blue, #6ec6ea)"]
], Ya = [
  ["0%", "var(--brand-copa-yellow, #f7d117)"],
  ["38%", "var(--brand-copa-green, #169b45)"],
  ["72%", "var(--brand-copa-blue, #0057b8)"],
  ["100%", "var(--brand-copa-yellow, #f7d117)"]
], Ja = "_iconbtn_7p48h_1", es = "_md_7p48h_18", ts = "_lg_7p48h_26", ns = "_sm_7p48h_34", as = "_ghost_7p48h_43", ss = "_outline_7p48h_50", rs = "_solid_7p48h_62", mn = {
  iconbtn: Ja,
  md: es,
  lg: ts,
  sm: ns,
  ghost: as,
  outline: ss,
  solid: rs
}, ge = te(function({ icon: t, variant: s = "ghost", size: a = "md", className: o, ...c }, i) {
  return /* @__PURE__ */ e(
    "button",
    {
      ref: i,
      className: g(mn.iconbtn, mn[s], mn[a], o),
      ...c,
      children: t
    }
  );
}), os = "_badge_1oq9f_1", cs = "_dot_1oq9f_15", ls = "_success_1oq9f_23", is = "_info_1oq9f_27", ds = "_warn_1oq9f_31", _s = "_danger_1oq9f_35", us = "_neutral_1oq9f_39", hn = {
  badge: os,
  dot: cs,
  success: ls,
  info: is,
  warn: ds,
  danger: _s,
  neutral: us
};
function Xe({ tone: n = "neutral", dot: t = !1, className: s, children: a, ...o }) {
  return /* @__PURE__ */ r("span", { className: g(hn.badge, hn[n], s), ...o, children: [
    t && /* @__PURE__ */ e("span", { className: hn.dot, "aria-hidden": "true" }),
    a
  ] });
}
const ms = "_wrap_1a3yj_1", hs = "_disabled_1a3yj_9", ps = "_input_1a3yj_13", fs = "_track_1a3yj_21", bs = "_thumb_1a3yj_28", Qt = {
  wrap: ms,
  disabled: hs,
  input: ps,
  track: fs,
  thumb: bs
}, gs = te(function({ className: t, disabled: s, ...a }, o) {
  return /* @__PURE__ */ r("label", { className: g(Qt.wrap, s && Qt.disabled, t), children: [
    /* @__PURE__ */ e("input", { ref: o, type: "checkbox", role: "switch", className: Qt.input, disabled: s, ...a }),
    /* @__PURE__ */ e("span", { className: Qt.track, "aria-hidden": "true", children: /* @__PURE__ */ e("span", { className: Qt.thumb }) })
  ] });
}), vs = "_avatar_10w8b_1", ys = "_img_10w8b_13", ks = "_xs_10w8b_18", Ns = "_sm_10w8b_23", $s = "_md_10w8b_28", ws = "_lg_10w8b_33", xs = "_xl_10w8b_38", Cs = "_square_10w8b_45", Ls = "_g0_10w8b_59", zs = "_g1_10w8b_62", Ms = "_g2_10w8b_69", Ds = "_g3_10w8b_76", Is = "_g4_10w8b_83", Ut = {
  avatar: vs,
  img: ys,
  xs: ks,
  sm: Ns,
  md: $s,
  lg: ws,
  xl: xs,
  square: Cs,
  g0: Ls,
  g1: zs,
  g2: Ms,
  g3: Ds,
  g4: Is
}, js = 5;
function Es(n) {
  let t = 0;
  for (let s = 0; s < n.length; s++) t = (t + n.charCodeAt(s) * (s + 1)) % 997;
  return t % js;
}
function Ze({
  initials: n,
  src: t,
  alt: s = "",
  size: a = "md",
  shape: o = "circle",
  color: c,
  seed: i,
  className: _,
  style: f,
  ...l
}) {
  const d = !t && !c && i != null && i.length > 0;
  return /* @__PURE__ */ e(
    "span",
    {
      className: g(
        Ut.avatar,
        Ut[a],
        o === "square" && Ut.square,
        d && Ut[`g${Es(i)}`],
        _
      ),
      style: {
        background: t || d ? void 0 : c ?? "var(--brand-gradient)",
        ...f
      },
      ...l,
      children: t ? /* @__PURE__ */ e("img", { className: Ut.img, src: t, alt: s }) : n
    }
  );
}
const Bs = "_kbd_ocxt0_1", As = {
  kbd: Bs
};
function nn({ className: n, children: t, ...s }) {
  return /* @__PURE__ */ e("kbd", { className: g(As.kbd, n), ...s, children: t });
}
const Ss = "_wrap_1nhk4_1", Rs = "_trigger_1nhk4_5", Ts = "_bubble_1nhk4_8", qs = "_portal_1nhk4_39", Os = "_content_1nhk4_45", Ws = "_label_1nhk4_50", Ps = "_description_1nhk4_51", Fs = "_shortcut_1nhk4_60", ft = {
  wrap: Ss,
  trigger: Rs,
  bubble: Ts,
  portal: qs,
  content: Os,
  label: Ws,
  description: Ps,
  shortcut: Fs
};
function vn({
  label: n,
  description: t,
  shortcut: s,
  side: a = "top",
  delayMs: o = 350,
  open: c,
  defaultOpen: i = !1,
  onOpenChange: _,
  portalled: f = !1,
  children: l,
  className: d
}) {
  const [u, m] = S(i), b = Y(null), p = Y(null), h = Y(null), [v, k] = S(null), [y, w] = S(null), $ = be(), C = c !== void 0, N = C ? c : u;
  function x(L) {
    C || m(L), _ == null || _(L);
  }
  function j() {
    b.current !== null && (window.clearTimeout(b.current), b.current = null);
  }
  function E() {
    j(), b.current = window.setTimeout(() => x(!0), o);
  }
  function O() {
    j(), x(!1);
  }
  J(() => () => j(), []), oa(() => {
    if (!N || !f) return;
    function L() {
      var V, W, H, G;
      w(((W = (V = p.current) == null ? void 0 : V.closest("[data-theme]")) == null ? void 0 : W.getAttribute("data-theme")) ?? null);
      const I = (H = p.current) == null ? void 0 : H.getBoundingClientRect(), z = (G = h.current) == null ? void 0 : G.getBoundingClientRect();
      if (!I || !z) return;
      const M = 10, F = {
        top: { top: I.top - z.height - M, left: I.left + (I.width - z.width) / 2 },
        bottom: { top: I.bottom + M, left: I.left + (I.width - z.width) / 2 },
        left: { top: I.top + (I.height - z.height) / 2, left: I.left - z.width - M },
        right: { top: I.top + (I.height - z.height) / 2, left: I.right + M }
      };
      k(F[a]);
    }
    return L(), window.addEventListener("resize", L), window.addEventListener("scroll", L, !0), () => {
      window.removeEventListener("resize", L), window.removeEventListener("scroll", L, !0);
    };
  }, [N, f, a, n, t, s]);
  const T = Nn(l) ? $n(l, {
    "aria-describedby": g(
      l.props["aria-describedby"],
      N && $
    )
  }) : l, B = N ? /* @__PURE__ */ r(
    "span",
    {
      ref: h,
      role: "tooltip",
      id: $,
      "data-side": a,
      "data-theme": f ? y ?? void 0 : void 0,
      className: g(ft.bubble, f && ft.portal),
      style: f ? { top: (v == null ? void 0 : v.top) ?? 0, left: (v == null ? void 0 : v.left) ?? 0, visibility: v ? "visible" : "hidden" } : void 0,
      children: [
        /* @__PURE__ */ r("span", { className: ft.content, children: [
          /* @__PURE__ */ e("span", { className: ft.label, children: n }),
          t && /* @__PURE__ */ e("span", { className: ft.description, children: t })
        ] }),
        s && /* @__PURE__ */ e(nn, { className: ft.shortcut, children: s })
      ]
    }
  ) : null;
  return /* @__PURE__ */ r(
    "span",
    {
      className: g(ft.wrap, d),
      onMouseEnter: E,
      onMouseLeave: O,
      onFocusCapture: E,
      onBlurCapture: O,
      onKeyDown: (L) => {
        L.key === "Escape" && O();
      },
      children: [
        /* @__PURE__ */ e("span", { ref: p, className: ft.trigger, children: T }),
        f && typeof document < "u" ? ca(B, document.body) : B
      ]
    }
  );
}
const Hs = "_group_15y4b_1", Qs = "_sm_15y4b_6", Us = "_md_15y4b_9", Vs = "_lg_15y4b_12", Gs = "_item_15y4b_17", Ks = "_ring_15y4b_47", Xs = "_overflow_15y4b_52", Zs = "_tipNames_15y4b_58", Qe = {
  group: Hs,
  sm: Qs,
  md: Us,
  lg: Vs,
  item: Gs,
  ring: Ks,
  overflow: Xs,
  tipNames: Zs
};
function Ys(n) {
  const t = n.trim().split(/\s+/).filter(Boolean);
  if (t.length === 0) return "?";
  const s = t[0][0] ?? "", a = t.length > 1 ? t[t.length - 1][0] ?? "" : "";
  return (s + a).toUpperCase();
}
const zv = te(function({ items: t, max: s = 4, size: a = "md", onItemClick: o, onOverflowClick: c, className: i, ..._ }, f) {
  const l = t.slice(0, Math.max(0, s)), d = t.slice(Math.max(0, s)), u = d.length, m = t.length === 1 ? t[0].name : `${t.length} pessoas`;
  return /* @__PURE__ */ r(
    "div",
    {
      ref: f,
      role: "group",
      "aria-label": _["aria-label"] ?? m,
      className: g(Qe.group, Qe[a], i),
      ..._,
      children: [
        l.map((b, p) => {
          const h = /* @__PURE__ */ e(
            Ze,
            {
              size: a,
              src: b.src,
              alt: "",
              initials: b.initials ?? Ys(b.name),
              color: b.color,
              className: Qe.ring
            }
          ), v = l.length + 1 - p;
          return /* @__PURE__ */ e(vn, { label: b.name, children: o ? /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: Qe.item,
              style: { zIndex: v },
              "aria-label": b.name,
              onClick: () => o(b, p),
              children: h
            }
          ) : /* @__PURE__ */ e("span", { className: Qe.item, style: { zIndex: v }, children: h }) }, `${b.name}-${p}`);
        }),
        u > 0 && /* @__PURE__ */ e(vn, { label: d.map((b) => b.name).join(", "), children: c ? /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: Qe.item,
            style: { zIndex: 0 },
            "aria-label": `Mais ${u} ${u === 1 ? "pessoa" : "pessoas"}`,
            onClick: c,
            children: /* @__PURE__ */ e(
              Ze,
              {
                size: a,
                initials: `+${u}`,
                color: "var(--surface-2, var(--surface-container-high))",
                className: g(Qe.ring, Qe.overflow)
              }
            )
          }
        ) : /* @__PURE__ */ e(
          "span",
          {
            className: Qe.item,
            style: { zIndex: 0 },
            "aria-label": `Mais ${u} ${u === 1 ? "pessoa" : "pessoas"}`,
            children: /* @__PURE__ */ e(
              Ze,
              {
                size: a,
                initials: `+${u}`,
                color: "var(--surface-2, var(--surface-container-high))",
                className: g(Qe.ring, Qe.overflow)
              }
            )
          }
        ) })
      ]
    }
  );
}), Js = "_card_1tefa_1", er = "_e0_1tefa_19", tr = "_inverted_1tefa_26", nr = "_e1_1tefa_67", ar = "_e2_1tefa_70", sr = "_e3_1tefa_73", rr = "_e4_1tefa_76", or = "_header_1tefa_89", cr = "_title_1tefa_95", lr = "_count_1tefa_104", ir = "_action_1tefa_114", $t = {
  card: Js,
  "p-none": "_p-none_1tefa_10",
  "p-sm": "_p-sm_1tefa_13",
  "p-md": "_p-md_1tefa_16",
  e0: er,
  inverted: tr,
  e1: nr,
  e2: ar,
  e3: sr,
  e4: rr,
  header: or,
  title: cr,
  count: lr,
  action: ir
};
function Xn({
  elevation: n = 0,
  padding: t = "md",
  tone: s = "default",
  className: a,
  children: o,
  ...c
}) {
  return /* @__PURE__ */ e(
    "div",
    {
      className: g(
        $t.card,
        $t[`e${n}`],
        $t[`p-${t}`],
        s === "inverted" && $t.inverted,
        a
      ),
      ...c,
      children: o
    }
  );
}
function Mv({ title: n, count: t, action: s, className: a, ...o }) {
  return /* @__PURE__ */ r("div", { className: g($t.header, a), ...o, children: [
    /* @__PURE__ */ e("h3", { className: $t.title, children: n }),
    t != null && /* @__PURE__ */ e("span", { className: $t.count, children: t }),
    s && /* @__PURE__ */ e("div", { className: $t.action, children: s })
  ] });
}
const dr = "_track_1y4vw_1", _r = "_sm_1y4vw_7", ur = "_md_1y4vw_10", mr = "_fill_1y4vw_13", hr = "_primary_1y4vw_19", pr = "_neutral_1y4vw_22", fr = "_warn_1y4vw_25", br = "_critical_1y4vw_28", gr = "_indeterminate_1y4vw_33", Vt = {
  track: dr,
  sm: _r,
  md: ur,
  fill: mr,
  primary: hr,
  neutral: pr,
  warn: fr,
  critical: br,
  indeterminate: gr,
  "refy-progress-indeterminate": "_refy-progress-indeterminate_1y4vw_1"
};
function jt({
  value: n = 0,
  tone: t = "primary",
  size: s = "md",
  indeterminate: a = !1,
  className: o,
  ...c
}) {
  const i = Math.max(0, Math.min(100, n));
  return /* @__PURE__ */ e(
    "div",
    {
      className: g(Vt.track, Vt[s], o),
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      ...a ? { "aria-busy": !0 } : { "aria-valuenow": i },
      ...c,
      children: /* @__PURE__ */ e(
        "span",
        {
          className: g(Vt.fill, Vt[t], a && Vt.indeterminate),
          style: a ? void 0 : { width: `${i}%` }
        }
      )
    }
  );
}
const vr = "_root_gjfb3_1", yr = "_summary_gjfb3_8", kr = "_back_gjfb3_14", Nr = "_copy_gjfb3_17", $r = "_count_gjfb3_32", wr = "_progress_gjfb3_40", xr = "_steps_gjfb3_43", Cr = "_step_gjfb3_43", Lr = "_stepButton_gjfb3_76", zr = "_marker_gjfb3_95", Mr = "_stepLabel_gjfb3_118", Dr = "_complete_gjfb3_128", Ir = "_current_gjfb3_134", jr = "_disabled_gjfb3_148", Er = "_compact_gjfb3_151", Br = "_horizontal_gjfb3_154", Ar = "_auto_gjfb3_159", xe = {
  root: vr,
  summary: yr,
  back: kr,
  copy: Nr,
  count: $r,
  progress: wr,
  steps: xr,
  step: Cr,
  stepButton: Lr,
  marker: zr,
  stepLabel: Mr,
  complete: Dr,
  current: Ir,
  disabled: jr,
  compact: Er,
  horizontal: Br,
  auto: Ar
};
function Dv({
  steps: n,
  current: t,
  label: s = "Progresso",
  variant: a = "auto",
  allowFutureNavigation: o = !1,
  onStepChange: c,
  onBack: i,
  backLabel: _ = "Voltar à etapa anterior",
  className: f
}) {
  const l = Math.max(0, n.findIndex((h) => h.id === t)), d = n[l], u = Y({}), m = fe(
    () => n.filter((h, v) => !h.disabled && (o || v <= l)),
    [n, l, o]
  ), b = n.length ? (l + 1) / n.length * 100 : 0;
  function p(h, v) {
    var $;
    if (h.key === "Enter" || h.key === " ") {
      h.preventDefault(), c == null || c(v);
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(h.key)) return;
    h.preventDefault();
    const k = m.findIndex((C) => C.id === v);
    let y = k;
    h.key === "Home" ? y = 0 : h.key === "End" ? y = m.length - 1 : h.key === "ArrowLeft" ? y = (k - 1 + m.length) % m.length : y = (k + 1) % m.length;
    const w = m[y];
    w && (($ = u.current[w.id]) == null || $.focus());
  }
  return /* @__PURE__ */ r(
    "nav",
    {
      className: g(xe.root, xe[a], f),
      "aria-label": s,
      style: {
        "--step-count": Math.max(n.length, 1),
        "--wizard-ratio": n.length > 1 ? l / (n.length - 1) : 1
      },
      children: [
        /* @__PURE__ */ r("div", { className: xe.summary, children: [
          i && /* @__PURE__ */ e(
            ge,
            {
              className: xe.back,
              size: "sm",
              variant: "ghost",
              "aria-label": _,
              disabled: l === 0,
              onClick: i,
              icon: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "m15 18-6-6 6-6" }) })
            }
          ),
          /* @__PURE__ */ r("div", { className: xe.copy, children: [
            /* @__PURE__ */ e("span", { children: s }),
            /* @__PURE__ */ e("strong", { children: (d == null ? void 0 : d.label) ?? "Etapa" })
          ] }),
          /* @__PURE__ */ r("b", { className: xe.count, children: [
            Math.min(l + 1, n.length),
            " de ",
            n.length
          ] })
        ] }),
        /* @__PURE__ */ e(
          jt,
          {
            className: xe.progress,
            value: b,
            size: "sm",
            "aria-label": `${s}: etapa ${l + 1} de ${n.length}`
          }
        ),
        /* @__PURE__ */ e("ol", { className: xe.steps, children: n.map((h, v) => {
          const k = v < l ? "complete" : v === l ? "current" : "future", y = !h.disabled && (o || v <= l);
          return /* @__PURE__ */ e("li", { className: g(xe.step, xe[k], h.disabled && xe.disabled), children: /* @__PURE__ */ r(
            "button",
            {
              ref: (w) => {
                u.current[h.id] = w;
              },
              type: "button",
              className: xe.stepButton,
              "aria-current": k === "current" ? "step" : void 0,
              "aria-label": `${h.label}: ${k === "complete" ? "concluída" : k === "current" ? "etapa atual" : "não iniciada"}`,
              disabled: !y,
              tabIndex: k === "current" ? 0 : -1,
              onClick: () => c == null ? void 0 : c(h.id),
              onKeyDown: (w) => p(w, h.id),
              children: [
                /* @__PURE__ */ e("span", { className: xe.marker, "aria-hidden": "true", children: k === "complete" ? /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "m20 6-11 11-5-5" }) }) : v + 1 }),
                /* @__PURE__ */ e("span", { className: xe.stepLabel, children: h.label })
              ]
            }
          ) }, h.id);
        }) })
      ]
    }
  );
}
const Sr = "_callout_1tlfa_1", Rr = "_closing_1tlfa_15", Tr = "_info_1tlfa_22", qr = "_icon_1tlfa_26", Or = "_note_1tlfa_28", Wr = "_warn_1tlfa_34", Pr = "_danger_1tlfa_40", Fr = "_upsell_1tlfa_46", Hr = "_body_1tlfa_70", Qr = "_title_1tlfa_75", Ur = "_text_1tlfa_83", Vr = "_action_1tlfa_91", Gr = "_close_1tlfa_96", rt = {
  callout: Sr,
  closing: Rr,
  info: Tr,
  icon: qr,
  note: Or,
  warn: Wr,
  danger: Pr,
  upsell: Fr,
  body: Hr,
  title: Qr,
  text: Ur,
  action: Vr,
  close: Gr
}, xt = te(function({
  tone: t = "info",
  icon: s,
  title: a,
  children: o,
  action: c,
  dismissible: i = !1,
  onDismiss: _,
  dismissLabel: f = "Dispensar aviso",
  className: l,
  ...d
}, u) {
  const [m, b] = S(!1), [p, h] = S(!1), v = Y(!1), k = Y(void 0), y = Ft(() => {
    v.current || (v.current = !0, h(!0), _ == null || _());
  }, [_]);
  J(() => () => window.clearTimeout(k.current), []);
  const w = () => {
    b(!0), k.current = window.setTimeout(y, 260);
  }, $ = (C) => {
    C.target === C.currentTarget && m && y();
  };
  return p ? null : /* @__PURE__ */ r(
    "div",
    {
      ref: u,
      role: "note",
      className: g(rt.callout, rt[t], m && rt.closing, l),
      onTransitionEnd: $,
      ...d,
      children: [
        s != null && /* @__PURE__ */ e("span", { className: rt.icon, "aria-hidden": "true", children: s }),
        /* @__PURE__ */ r("div", { className: rt.body, children: [
          /* @__PURE__ */ e("p", { className: rt.title, children: a }),
          o != null && /* @__PURE__ */ e("div", { className: rt.text, children: o })
        ] }),
        c != null && /* @__PURE__ */ e("div", { className: rt.action, children: c }),
        i && /* @__PURE__ */ e(
          ge,
          {
            size: "sm",
            variant: "ghost",
            className: rt.close,
            "aria-label": f,
            onClick: w,
            icon: /* @__PURE__ */ e(
              "svg",
              {
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                "aria-hidden": "true",
                children: /* @__PURE__ */ e("path", { d: "M18 6 6 18M6 6l12 12" })
              }
            )
          }
        )
      ]
    }
  );
}), Kr = "_idle_k7nai_1", Xr = "_idleCopy_k7nai_8", Zr = "_panel_k7nai_21", Yr = "_header_k7nai_30", Jr = "_mic_k7nai_35", eo = "_isPaused_k7nai_58", to = "_statusCopy_k7nai_65", no = "_time_k7nai_79", ao = "_meter_k7nai_86", so = "_wave_k7nai_90", ro = "_errorActions_k7nai_110", oo = "_footer_k7nai_111", We = {
  idle: Kr,
  idleCopy: Xr,
  panel: Zr,
  header: Yr,
  mic: Jr,
  isPaused: eo,
  statusCopy: to,
  time: no,
  meter: ao,
  wave: so,
  errorActions: ro,
  footer: oo
}, on = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ e("rect", { x: "9", y: "2", width: "6", height: "12", rx: "3" }),
  /* @__PURE__ */ e("path", { d: "M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" })
] });
function co(n) {
  const t = Math.max(0, Math.floor(n));
  return `${Math.floor(t / 60).toString().padStart(2, "0")}:${(t % 60).toString().padStart(2, "0")}`;
}
function lo({
  state: n = "idle",
  duration: t = 0,
  level: s = 0,
  errorMessage: a = "Revise a permissão do navegador ou continue pelo teclado.",
  onStart: o,
  onPause: c,
  onResume: i,
  onCancel: _,
  onFinish: f,
  onRetry: l,
  onUseFallback: d,
  className: u
}) {
  const m = Math.max(0, Math.min(100, s));
  if (n === "error")
    return /* @__PURE__ */ e(
      xt,
      {
        className: u,
        tone: "danger",
        role: "alert",
        icon: on,
        title: "Não conseguimos acessar o microfone",
        action: /* @__PURE__ */ r("div", { className: We.errorActions, children: [
          /* @__PURE__ */ e(oe, { size: "sm", variant: "primary", onClick: l, children: "Tentar novamente" }),
          /* @__PURE__ */ e(oe, { size: "sm", variant: "secondary", onClick: d, children: "Usar ditado" })
        ] }),
        children: a
      }
    );
  if (n === "fallback")
    return /* @__PURE__ */ e(
      xt,
      {
        className: u,
        tone: "note",
        icon: on,
        title: "Use o ditado do seu celular",
        action: /* @__PURE__ */ e(oe, { size: "sm", variant: "secondary", onClick: d, children: "Entendi" }),
        children: "Toque no microfone do teclado. O texto aparece no campo e continua editável antes de enviar."
      }
    );
  if (n === "idle")
    return /* @__PURE__ */ r("div", { className: g(We.idle, u), children: [
      /* @__PURE__ */ e(ge, { "aria-label": "Começar gravação de voz", variant: "solid", size: "lg", icon: on, onClick: o }),
      /* @__PURE__ */ r("div", { className: We.idleCopy, children: [
        /* @__PURE__ */ e("strong", { children: "Prefere falar?" }),
        /* @__PURE__ */ e("span", { children: "Conte do seu jeito. Você revisa o texto antes de continuar." })
      ] })
    ] });
  const b = n === "listening";
  return /* @__PURE__ */ r("section", { className: g(We.panel, !b && We.isPaused, u), "aria-label": "Gravação de voz", children: [
    /* @__PURE__ */ r("div", { className: We.header, children: [
      /* @__PURE__ */ e("span", { className: We.mic, "aria-hidden": "true", children: on }),
      /* @__PURE__ */ r("div", { className: We.statusCopy, children: [
        /* @__PURE__ */ e("strong", { children: b ? "Escutando você" : "Gravação pausada" }),
        /* @__PURE__ */ e("span", { children: b ? "Fale normalmente. O texto aparece enquanto você fala." : "Retome quando estiver pronto." })
      ] }),
      /* @__PURE__ */ e("time", { className: We.time, dateTime: `PT${Math.floor(t)}S`, children: co(t) })
    ] }),
    /* @__PURE__ */ r("div", { className: We.meter, style: { "--voice-level": m }, children: [
      /* @__PURE__ */ e("div", { className: We.wave, "aria-hidden": "true", children: [0.55, 0.85, 1, 0.72, 0.42, 0.7, 0.92, 0.6].map((p, h) => /* @__PURE__ */ e("i", { style: { "--bar-factor": p } }, h)) }),
      /* @__PURE__ */ e(
        jt,
        {
          value: b ? m : 0,
          size: "sm",
          "aria-label": b ? `Nível do microfone: ${Math.round(m)}%` : "Microfone pausado"
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: We.footer, children: [
      /* @__PURE__ */ e(oe, { size: "sm", variant: "ghost", onClick: _, children: "Cancelar" }),
      /* @__PURE__ */ e(
        ge,
        {
          "aria-label": b ? "Pausar gravação" : "Retomar gravação",
          variant: "outline",
          icon: b ? /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: [
            /* @__PURE__ */ e("rect", { x: "6", y: "5", width: "4", height: "14", rx: "1" }),
            /* @__PURE__ */ e("rect", { x: "14", y: "5", width: "4", height: "14", rx: "1" })
          ] }) : /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "m8 5 11 7-11 7z" }) }),
          onClick: b ? c : i
        }
      ),
      /* @__PURE__ */ e(oe, { size: "sm", variant: "primary", onClick: f, children: "Concluir" })
    ] })
  ] });
}
const io = "_chip_q3smj_1", _o = "_selected_q3smj_27", uo = "_icon_q3smj_59", mo = "_label_q3smj_68", ho = "_count_q3smj_71", po = "_check_q3smj_84", fo = "_dot_q3smj_96", bo = "_remove_q3smj_101", ot = {
  chip: io,
  selected: _o,
  icon: uo,
  label: mo,
  count: ho,
  check: po,
  dot: fo,
  "tone-critical": "_tone-critical_q3smj_97",
  "tone-warning": "_tone-warning_q3smj_98",
  "tone-success": "_tone-success_q3smj_99",
  "tone-info": "_tone-info_q3smj_100",
  remove: bo
}, yn = te(function({ selected: t = !1, count: s, tone: a = "neutral", selectionMode: o = "toggle", showCheck: c = !1, removable: i = !1, onRemove: _, onClick: f, leadingIcon: l, className: d, children: u, ...m }, b) {
  return /* @__PURE__ */ r(
    "button",
    {
      ref: b,
      type: "button",
      className: g(ot.chip, t && ot.selected, d),
      role: o === "radio" ? "radio" : void 0,
      "aria-checked": o === "radio" ? t : void 0,
      "aria-pressed": o === "toggle" ? t : void 0,
      onClick: (p) => {
        f == null || f(p), i && (_ == null || _());
      },
      ...m,
      children: [
        c && /* @__PURE__ */ e("span", { className: ot.check, "aria-hidden": "true", children: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" }) }) }),
        l && /* @__PURE__ */ e("span", { className: ot.icon, children: l }),
        a !== "neutral" && /* @__PURE__ */ e("span", { className: g(ot.dot, ot[`tone-${a}`]), "aria-hidden": "true" }),
        /* @__PURE__ */ e("span", { className: ot.label, children: u }),
        typeof s == "number" && /* @__PURE__ */ e("span", { className: ot.count, children: s }),
        i && /* @__PURE__ */ e(
          "span",
          {
            className: ot.remove,
            "aria-hidden": "true",
            children: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", width: "12", height: "12", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", children: /* @__PURE__ */ e("path", { d: "M18 6 6 18M6 6l12 12" }) })
          }
        )
      ]
    }
  );
}), go = "_field_17s6u_1", vo = "_label_17s6u_10", yo = "_wrap_17s6u_19", ko = "_shell_17s6u_25", No = "_open_17s6u_43", $o = "_hasError_17s6u_48", wo = "_disabled_17s6u_55", xo = "_chips_17s6u_61", Co = "_noMask_17s6u_80", Lo = "_chip_17s6u_61", zo = "_chipRemove_17s6u_101", Mo = "_overflow_17s6u_138", Do = "_input_17s6u_152", Io = "_caret_17s6u_168", jo = "_pop_17s6u_199", Eo = "_option_17s6u_226", Bo = "_optionActive_17s6u_238", Ao = "_optionSelected_17s6u_241", So = "_optionDisabled_17s6u_247", Ro = "_check_17s6u_252", To = "_empty_17s6u_277", qo = "_help_17s6u_284", Oo = "_helpError_17s6u_290", se = {
  field: go,
  label: vo,
  wrap: yo,
  shell: ko,
  open: No,
  hasError: $o,
  disabled: wo,
  chips: xo,
  noMask: Co,
  chip: Lo,
  chipRemove: zo,
  overflow: Mo,
  input: Do,
  caret: Io,
  pop: jo,
  option: Eo,
  optionActive: Bo,
  optionSelected: Ao,
  optionDisabled: So,
  check: Ro,
  empty: To,
  help: qo,
  helpError: Oo
}, Zn = te(function({
  options: t,
  value: s,
  defaultValue: a = [],
  onChange: o,
  label: c,
  maxVisibleChips: i = 3,
  emptyMessage: _ = "Nenhuma opção",
  error: f,
  hint: l,
  disabled: d,
  placeholder: u = "Adicionar…",
  className: m,
  id: b,
  ...p
}, h) {
  const v = be(), k = b || `${v}-input`, y = `${v}-listbox`, [w, $] = S(a), C = s !== void 0 ? s : w, N = fe(
    () => C.map((R) => t.find((D) => D.value === R)).filter(Boolean),
    [C, t]
  ), [x, j] = S(""), [E, O] = S(!1), [T, B] = S(0), L = Y(null), I = Y(null), z = Y(null), [M, F] = S(!1), V = fe(() => {
    const R = x.trim().toLowerCase();
    return R ? t.filter((D) => D.label.toLowerCase().includes(R)) : t;
  }, [t, x]), W = V[T] ?? null, H = W ? `${v}-opt-${T}` : void 0;
  J(() => {
    T >= V.length && B(0);
  }, [V.length, T]), J(() => {
    var R;
    E && H && ((R = document.getElementById(H)) == null || R.scrollIntoView({ block: "nearest" }));
  }, [E, H]), J(() => {
    if (!E) return;
    function R(D) {
      var A;
      (A = L.current) != null && A.contains(D.target) || O(!1);
    }
    return document.addEventListener("pointerdown", R), () => document.removeEventListener("pointerdown", R);
  }, [E]), J(() => {
    const R = I.current;
    R && (F(R.scrollWidth > R.clientWidth), R.scrollLeft = R.scrollWidth);
  }, [N.length, i]);
  function G(R) {
    s === void 0 && $(R), o == null || o(R);
  }
  function ce(R) {
    R.disabled || G(
      C.includes(R.value) ? C.filter((D) => D !== R.value) : [...C, R.value]
    );
  }
  function ue(R) {
    G(C.filter((D) => D !== R));
  }
  function Ye(R) {
    switch (R.key) {
      case "ArrowDown":
        R.preventDefault(), E ? B((D) => Math.min(D + 1, V.length - 1)) : O(!0);
        break;
      case "ArrowUp":
        R.preventDefault(), E ? B((D) => Math.max(D - 1, 0)) : O(!0);
        break;
      case "Home":
        E && (R.preventDefault(), B(0));
        break;
      case "End":
        E && (R.preventDefault(), B(V.length - 1));
        break;
      case "Enter":
        E && W && (R.preventDefault(), ce(W));
        break;
      case "Escape":
        R.preventDefault(), O(!1);
        break;
      case "Backspace":
        !x && C.length && ue(C[C.length - 1]);
        break;
      case "Tab":
        O(!1);
        break;
    }
  }
  const U = N.slice(0, i), K = N.length - U.length;
  return /* @__PURE__ */ r("div", { className: g(se.field, m), children: [
    c && /* @__PURE__ */ e("label", { className: se.label, htmlFor: k, children: c }),
    /* @__PURE__ */ r(
      "div",
      {
        ref: L,
        className: g(se.wrap, E && se.open, f && se.hasError, d && se.disabled),
        children: [
          /* @__PURE__ */ r(
            "div",
            {
              className: se.shell,
              onClick: () => {
                var R;
                (R = z.current) == null || R.focus(), O(!0);
              },
              children: [
                /* @__PURE__ */ r(
                  "div",
                  {
                    ref: I,
                    className: g(se.chips, (!M || i !== void 0) && se.noMask),
                    children: [
                      U.map((R) => /* @__PURE__ */ r("span", { className: se.chip, children: [
                        R.label,
                        /* @__PURE__ */ e(
                          "button",
                          {
                            type: "button",
                            className: se.chipRemove,
                            "aria-label": `Remover ${R.label}`,
                            disabled: d,
                            onClick: (D) => {
                              D.stopPropagation(), ue(R.value);
                            },
                            children: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", "aria-hidden": "true", children: [
                              /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
                              /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" })
                            ] })
                          }
                        )
                      ] }, R.value)),
                      K > 0 && /* @__PURE__ */ r("span", { className: se.overflow, children: [
                        "+",
                        K
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ e(
                  "input",
                  {
                    ...p,
                    ref: (R) => {
                      z.current = R, typeof h == "function" ? h(R) : h && (h.current = R);
                    },
                    id: k,
                    className: se.input,
                    role: "combobox",
                    "aria-expanded": E,
                    "aria-controls": y,
                    "aria-autocomplete": "list",
                    "aria-activedescendant": E ? H : void 0,
                    "aria-invalid": f ? !0 : void 0,
                    autoComplete: "off",
                    spellCheck: !1,
                    placeholder: C.length ? "" : u,
                    disabled: d,
                    value: x,
                    onChange: (R) => {
                      j(R.target.value), O(!0), B(0);
                    },
                    onKeyDown: Ye
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: se.caret,
                    "aria-label": E ? "Fechar opções" : "Abrir opções",
                    tabIndex: -1,
                    disabled: d,
                    onClick: (R) => {
                      var D;
                      R.stopPropagation(), O((A) => !A), (D = z.current) == null || D.focus();
                    },
                    children: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) })
                  }
                )
              ]
            }
          ),
          E && /* @__PURE__ */ e("div", { id: y, role: "listbox", "aria-multiselectable": "true", "aria-label": c || u, className: se.pop, children: V.length === 0 ? /* @__PURE__ */ e("div", { className: se.empty, children: _ }) : V.map((R, D) => {
            const A = C.includes(R.value), P = D === T;
            return /* @__PURE__ */ r(
              "div",
              {
                id: `${v}-opt-${D}`,
                role: "option",
                "aria-selected": A,
                "aria-disabled": R.disabled || void 0,
                className: g(
                  se.option,
                  A && se.optionSelected,
                  P && se.optionActive,
                  R.disabled && se.optionDisabled
                ),
                onMouseEnter: () => B(D),
                onMouseDown: (Q) => Q.preventDefault(),
                onClick: () => ce(R),
                children: [
                  /* @__PURE__ */ e("span", { className: se.check, children: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" }) }) }),
                  R.label
                ]
              },
              R.value
            );
          }) })
        ]
      }
    ),
    (f || l) && /* @__PURE__ */ e("p", { className: g(se.help, f && se.helpError), children: f || l })
  ] });
}), Wo = "_segmented_187ux_1", Po = "_disabled_187ux_10", Fo = "_segment_187ux_1", Ho = "_active_187ux_33", Qo = "_icon_187ux_55", Gt = {
  segmented: Wo,
  disabled: Po,
  segment: Fo,
  active: Ho,
  icon: Qo
};
function Yn({
  options: n,
  value: t,
  defaultValue: s,
  onChange: a,
  label: o,
  disabled: c,
  className: i
}) {
  var m;
  const [_, f] = S(s ?? ((m = n[0]) == null ? void 0 : m.value)), l = t !== void 0 ? t : _;
  function d(b) {
    t === void 0 && f(b), a == null || a(b);
  }
  function u(b) {
    var k;
    if (b.key !== "ArrowLeft" && b.key !== "ArrowRight") return;
    b.preventDefault();
    const p = n.filter((y) => !y.disabled), h = p.findIndex((y) => y.value === l), v = p[(h + (b.key === "ArrowRight" ? 1 : p.length - 1)) % p.length];
    v && (d(v.value), (k = b.currentTarget.querySelector(`[data-value="${v.value}"]`)) == null || k.focus());
  }
  return /* @__PURE__ */ e(
    "div",
    {
      role: "radiogroup",
      "aria-label": o,
      className: g(Gt.segmented, c && Gt.disabled, i),
      onKeyDown: u,
      children: n.map((b) => {
        const p = b.value === l;
        return /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            role: "radio",
            "data-value": b.value,
            "aria-checked": p,
            tabIndex: p ? 0 : -1,
            disabled: c || b.disabled,
            className: g(Gt.segment, p && Gt.active),
            onClick: () => d(b.value),
            children: [
              b.icon && /* @__PURE__ */ e("span", { className: Gt.icon, children: b.icon }),
              b.label
            ]
          },
          b.value
        );
      })
    }
  );
}
const Uo = "_field_1rgs8_1", Vo = "_block_1rgs8_2", Go = "_label_1rgs8_4", Ko = "_textarea_1rgs8_13", Xo = "_hasError_1rgs8_33", Zo = "_disabled_1rgs8_35", Yo = "_help_1rgs8_37", Jo = "_helpError_1rgs8_38", bt = {
  field: Uo,
  block: Vo,
  label: Go,
  textarea: Ko,
  hasError: Xo,
  disabled: Zo,
  help: Yo,
  helpError: Jo
}, ec = te(function({ label: t, hint: s, error: a, block: o = !0, className: c, id: i, disabled: _, rows: f = 3, ...l }, d) {
  const u = i || (t ? `ta-${t.replace(/\s+/g, "-").toLowerCase()}` : void 0);
  return /* @__PURE__ */ r("div", { className: g(bt.field, o && bt.block, c), children: [
    t && /* @__PURE__ */ e("label", { className: bt.label, htmlFor: u, children: t }),
    /* @__PURE__ */ e(
      "textarea",
      {
        ref: d,
        id: u,
        rows: f,
        disabled: _,
        className: g(bt.textarea, a && bt.hasError, _ && bt.disabled),
        ...l
      }
    ),
    (a || s) && /* @__PURE__ */ e("p", { className: g(bt.help, a && bt.helpError), children: a || s })
  ] });
}), tc = "_root_1irzn_1", nc = "_filters_1irzn_6", ac = "_filterGroup_1irzn_12", sc = "_filterLabel_1irzn_17", rc = "_multiselect_1irzn_24", oc = "_shell_1irzn_25", cc = "_hasError_1irzn_37", lc = "_textarea_1irzn_40", ic = "_voice_1irzn_54", dc = "_footer_1irzn_57", _c = "_examples_1irzn_66", uc = "_actions_1irzn_84", mc = "_processing_1irzn_90", Ee = {
  root: tc,
  filters: nc,
  filterGroup: ac,
  filterLabel: sc,
  multiselect: rc,
  shell: oc,
  hasError: cc,
  textarea: lc,
  voice: ic,
  footer: dc,
  examples: _c,
  actions: uc,
  processing: mc
}, hc = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ e("rect", { x: "9", y: "2", width: "6", height: "12", rx: "3" }),
  /* @__PURE__ */ e("path", { d: "M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" })
] });
function Iv({
  state: n = "idle",
  filters: t = [],
  filterValues: s,
  defaultFilterValues: a = {},
  onFilterValuesChange: o,
  value: c,
  defaultValue: i = "",
  onChange: _,
  label: f = "Conte o que você procura",
  placeholder: l = "Ex.: quero um apartamento com três quartos, boa luz e espaço para meus cachorros…",
  examples: d = [],
  submitLabel: u = "Continuar",
  understoodSummary: m,
  errorMessage: b = "Não conseguimos interpretar uma parte do pedido. Ajuste o texto e tente novamente.",
  onSubmit: p,
  onVoiceStart: h,
  onEditRequest: v,
  onEditDetails: k,
  voiceRecorderProps: y,
  className: w
}) {
  const [$, C] = S(i), [N, x] = S(a), j = c ?? $, E = s ?? N, O = n === "processing" || n === "understood";
  function T(I) {
    c === void 0 && C(I), _ == null || _(I);
  }
  function B(I) {
    s === void 0 && x(I), o == null || o(I);
  }
  function L(I, z) {
    const M = E[I.id] ?? [];
    B({
      ...E,
      [I.id]: I.mode === "single" ? [z] : M.includes(z) ? M.filter((F) => F !== z) : [...M, z]
    });
  }
  return /* @__PURE__ */ r("section", { className: g(Ee.root, w), "aria-label": "Compositor do pedido", children: [
    n === "understood" && m && /* @__PURE__ */ e(
      xt,
      {
        tone: "info",
        title: "Entendi assim",
        action: /* @__PURE__ */ e(oe, { size: "sm", variant: "secondary", onClick: k, children: "Revisar detalhes" }),
        children: m
      }
    ),
    /* @__PURE__ */ e("div", { className: Ee.filters, "aria-label": "Filtros iniciais", children: t.map((I) => {
      var M;
      const z = E[I.id] ?? [];
      return /* @__PURE__ */ r("div", { className: Ee.filterGroup, children: [
        /* @__PURE__ */ e("span", { className: Ee.filterLabel, children: I.label }),
        I.mode === "single" ? /* @__PURE__ */ e(
          Yn,
          {
            label: I.label,
            options: I.options,
            value: z[0] ?? ((M = I.options[0]) == null ? void 0 : M.value),
            disabled: O,
            onChange: (F) => L(I, F)
          }
        ) : /* @__PURE__ */ e(
          Zn,
          {
            className: Ee.multiselect,
            "aria-label": I.label,
            options: I.options,
            value: z,
            maxVisibleChips: 2,
            placeholder: `Selecionar ${I.label.toLowerCase()}…`,
            disabled: O,
            onChange: (F) => B({ ...E, [I.id]: F })
          }
        )
      ] }, I.id);
    }) }),
    n === "error" && /* @__PURE__ */ e(xt, { tone: "danger", role: "alert", title: "Precisamos de um pouco mais de contexto", children: b }),
    /* @__PURE__ */ r("div", { className: g(Ee.shell, n === "error" && Ee.hasError), children: [
      /* @__PURE__ */ e(
        ec,
        {
          className: Ee.textarea,
          label: f,
          value: j,
          placeholder: l,
          rows: 5,
          readOnly: O,
          "aria-busy": n === "processing" || void 0,
          onChange: (I) => T(I.target.value)
        }
      ),
      n === "listening" && /* @__PURE__ */ e("div", { className: Ee.voice, children: /* @__PURE__ */ e(lo, { state: (y == null ? void 0 : y.state) ?? "listening", transcript: j || void 0, ...y }) }),
      /* @__PURE__ */ r("div", { className: Ee.footer, children: [
        /* @__PURE__ */ r("div", { className: Ee.examples, "aria-label": "Exemplos de pedido", children: [
          d.length > 0 && /* @__PURE__ */ e("span", { children: "Experimente:" }),
          d.map((I) => /* @__PURE__ */ e(yn, { disabled: O, onClick: () => T(I), children: I }, I))
        ] }),
        /* @__PURE__ */ r("div", { className: Ee.actions, children: [
          n !== "listening" && /* @__PURE__ */ e(
            ge,
            {
              "aria-label": "Descrever por voz",
              variant: "ghost",
              icon: hc,
              disabled: O,
              onClick: h
            }
          ),
          /* @__PURE__ */ e(
            oe,
            {
              size: "sm",
              variant: "primary",
              status: n === "processing" ? "loading" : "idle",
              loadingLabel: "Entendendo…",
              disabled: !j.trim() || n === "understood",
              onClick: p,
              children: u
            }
          )
        ] })
      ] }),
      n === "processing" && /* @__PURE__ */ r("div", { className: Ee.processing, role: "status", children: [
        /* @__PURE__ */ r("div", { children: [
          /* @__PURE__ */ e("strong", { children: "Organizando o que você contou" }),
          /* @__PURE__ */ e("span", { children: "Estamos transformando o texto em critérios que você poderá revisar." })
        ] }),
        /* @__PURE__ */ e(oe, { size: "sm", variant: "ghost", onClick: v, children: "Quero editar" }),
        /* @__PURE__ */ e(jt, { indeterminate: !0, size: "sm", "aria-label": "Processando o pedido" })
      ] })
    ] })
  ] });
}
const pc = "_wrap_3r60g_1", fc = "_pop_3r60g_6", Dn = {
  wrap: pc,
  pop: fc
};
function bc({
  open: n,
  onOpenChange: t,
  content: s,
  children: a,
  side: o = "bottom",
  align: c = "start",
  label: i,
  className: _
}) {
  const f = Y(null);
  return J(() => {
    if (!n) return;
    function l(u) {
      var m;
      (m = f.current) != null && m.contains(u.target) || t(!1);
    }
    function d(u) {
      u.key === "Escape" && t(!1);
    }
    return document.addEventListener("pointerdown", l), document.addEventListener("keydown", d), () => {
      document.removeEventListener("pointerdown", l), document.removeEventListener("keydown", d);
    };
  }, [n, t]), /* @__PURE__ */ r("div", { ref: f, className: g(Dn.wrap, _), children: [
    a,
    n && /* @__PURE__ */ e(
      "div",
      {
        role: "dialog",
        "aria-label": i,
        "data-side": o,
        "data-align": c,
        className: Dn.pop,
        children: s
      }
    )
  ] });
}
const gc = "_anchorWrap_1qihh_1", vc = "_block_1qihh_5", yc = "_target_1qihh_9", kc = "_isActive_1qihh_17", Nc = "_card_1qihh_24", $c = "_cardHeader_1qihh_29", wc = "_copy_1qihh_42", xc = "_navigation_1qihh_57", wt = {
  anchorWrap: gc,
  block: vc,
  target: yc,
  isActive: kc,
  card: Nc,
  cardHeader: $c,
  copy: wc,
  navigation: xc
}, Jn = Vn(null);
function jv({
  steps: n,
  open: t,
  defaultOpen: s = !1,
  onOpenChange: a,
  currentStep: o,
  defaultStep: c,
  onStepChange: i,
  onComplete: _,
  children: f
}) {
  var N;
  const [l, d] = S(s), [u, m] = S(c ?? ((N = n[0]) == null ? void 0 : N.id)), b = t ?? l, p = o ?? u, h = Math.max(0, n.findIndex((x) => x.id === p));
  function v(x) {
    t === void 0 && d(x), a == null || a(x);
  }
  function k(x) {
    n.some((j) => j.id === x) && (o === void 0 && m(x), i == null || i(x));
  }
  function y() {
    const x = n[Math.max(0, h - 1)];
    x && k(x.id);
  }
  function w() {
    v(!1), _ == null || _();
  }
  function $() {
    const x = n[h + 1];
    x ? k(x.id) : w();
  }
  const C = fe(
    () => ({ steps: n, currentId: p, open: b, setOpen: v, go: k, previous: y, next: $, complete: w }),
    [n, p, b, h]
  );
  return /* @__PURE__ */ e(Jn.Provider, { value: C, children: f });
}
function Cc({ step: n, index: t, context: s }) {
  const a = t === s.steps.length - 1;
  return /* @__PURE__ */ r("div", { className: wt.card, children: [
    /* @__PURE__ */ r("div", { className: wt.cardHeader, children: [
      /* @__PURE__ */ r("span", { children: [
        t + 1,
        " de ",
        s.steps.length
      ] }),
      /* @__PURE__ */ e(
        ge,
        {
          autoFocus: !0,
          size: "sm",
          variant: "ghost",
          "aria-label": "Fechar tour",
          onClick: () => s.setOpen(!1),
          icon: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M18 6 6 18M6 6l12 12" }) })
        }
      )
    ] }),
    /* @__PURE__ */ e(jt, { value: (t + 1) / s.steps.length * 100, size: "sm", "aria-label": `Etapa ${t + 1} de ${s.steps.length}` }),
    /* @__PURE__ */ r("div", { className: wt.copy, children: [
      /* @__PURE__ */ e("h3", { children: n.title }),
      /* @__PURE__ */ e("div", { children: n.description })
    ] }),
    n.action && /* @__PURE__ */ e(
      oe,
      {
        size: "sm",
        variant: "secondary",
        block: !0,
        onClick: () => {
          var o, c;
          (o = n.action) == null || o.onAction(), (c = n.action) != null && c.advance && s.next();
        },
        children: n.action.label
      }
    ),
    /* @__PURE__ */ r("div", { className: wt.navigation, children: [
      /* @__PURE__ */ e(oe, { size: "sm", variant: "ghost", disabled: t === 0, onClick: s.previous, children: "Voltar" }),
      /* @__PURE__ */ e(oe, { size: "sm", variant: "primary", onClick: s.next, children: a ? "Concluir" : "Próximo" })
    ] })
  ] });
}
function Ev({ stepId: n, children: t, block: s = !1, className: a }) {
  const o = Un(Jn);
  if (!o) throw new Error("GuidedTourAnchor precisa estar dentro de GuidedTour.");
  const c = o.steps.find((d) => d.id === n);
  if (!c) throw new Error(`Etapa de tour inexistente: ${n}`);
  const i = o.steps.findIndex((d) => d.id === n), _ = o.open && o.currentId === n, f = Y(null), l = Y(_);
  return J(() => {
    var d;
    if (l.current && !_ && !o.open) {
      const u = (d = f.current) == null ? void 0 : d.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      u == null || u.focus();
    }
    l.current = _;
  }, [_]), /* @__PURE__ */ e(
    bc,
    {
      open: _,
      onOpenChange: o.setOpen,
      side: c.side ?? "bottom",
      align: c.align ?? "start",
      label: c.title,
      className: g(wt.anchorWrap, s && wt.block, _ && wt.isActive, a),
      content: /* @__PURE__ */ e(Cc, { step: c, index: i, context: o }),
      children: /* @__PURE__ */ e("div", { ref: f, className: wt.target, children: t })
    }
  );
}
const Lc = "_block_1xda6_1", zc = "_disabled_1xda6_6", Mc = "_row_1xda6_11", Dc = "_name_1xda6_17", Ic = "_readout_1xda6_22", jc = "_hist_1xda6_32", Ec = "_histIn_1xda6_48", Bc = "_range_1xda6_52", Ac = "_track_1xda6_60", Sc = "_fill_1xda6_61", Rc = "_thumb_1xda6_78", Tc = "_dragging_1xda6_98", qc = "_ticks_1xda6_110", Be = {
  block: Lc,
  disabled: zc,
  row: Mc,
  name: Dc,
  readout: Ic,
  hist: jc,
  histIn: Ec,
  range: Bc,
  track: Ac,
  fill: Sc,
  thumb: Rc,
  dragging: Tc,
  ticks: qc
}, cn = (n, t, s) => Math.min(s, Math.max(t, n)), Oc = te(function({
  min: t = 0,
  max: s = 100,
  step: a = 1,
  value: o,
  defaultValue: c,
  onChange: i,
  label: _,
  formatValue: f = String,
  showValue: l = !0,
  fixedMinimum: d = !1,
  ticks: u,
  histogram: m,
  disabled: b,
  className: p,
  ...h
}, v) {
  const k = be(), y = Y(null), [w, $] = S(c ?? [t, s]), [C, N] = S(null), x = o !== void 0 ? o : w, j = d ? t : cn(Math.min(x[0], x[1]), t, s), E = cn(Math.max(x[0], x[1]), t, s), O = s === t ? 0 : (j - t) / (s - t) * 100, T = s === t ? 0 : (E - t) / (s - t) * 100;
  function B(W) {
    const H = cn(Math.round((W - t) / a) * a + t, t, s), G = (String(a).split(".")[1] ?? "").length;
    return Number(H.toFixed(G));
  }
  function L(W, H) {
    if (d && W === "low") return;
    const G = W === "low" ? Math.min(B(H), E) : Math.max(B(H), j), ce = W === "low" ? [G, E] : [j, G];
    ce[0] === j && ce[1] === E || (o === void 0 && $(ce), i == null || i(ce));
  }
  function I(W) {
    const H = y.current.getBoundingClientRect(), G = cn((W.clientX - H.left) / H.width, 0, 1);
    return t + G * (s - t);
  }
  function z(W) {
    var ce, ue;
    if (b) return;
    W.preventDefault();
    const H = I(W), G = d ? "high" : Math.abs(H - j) < Math.abs(H - E) ? "low" : "high";
    W.currentTarget.setPointerCapture(W.pointerId), N(G), L(G, H), (ue = (ce = y.current) == null ? void 0 : ce.querySelector(`[data-thumb="${G}"]`)) == null || ue.focus();
  }
  function M(W) {
    !C || b || L(C, I(W));
  }
  function F(W) {
    return (H) => {
      if (b) return;
      const G = W === "low" ? j : E, ce = H.shiftKey ? a * 10 : a;
      switch (H.key) {
        case "ArrowRight":
        case "ArrowUp":
          H.preventDefault(), L(W, G + ce);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          H.preventDefault(), L(W, G - ce);
          break;
        case "Home":
          H.preventDefault(), L(W, W === "low" ? t : j);
          break;
        case "End":
          H.preventDefault(), L(W, W === "low" ? E : s);
          break;
        case "PageUp":
          H.preventDefault(), L(W, G + a * 10);
          break;
        case "PageDown":
          H.preventDefault(), L(W, G - a * 10);
          break;
      }
    };
  }
  function V(W) {
    const H = W === "low", G = H ? j : E;
    return /* @__PURE__ */ e(
      "div",
      {
        "data-thumb": W,
        role: "slider",
        tabIndex: b ? -1 : 0,
        "aria-label": `${_ ? `${_} — ` : ""}${d ? "valor" : H ? "mínimo" : "máximo"}`,
        "aria-valuemin": H ? t : j,
        "aria-valuemax": H ? E : s,
        "aria-valuenow": G,
        "aria-valuetext": f(G),
        "aria-disabled": b || void 0,
        className: g(Be.thumb, C === W && Be.dragging),
        style: { left: `${H ? O : T}%` },
        onKeyDown: F(W)
      }
    );
  }
  return /* @__PURE__ */ r("div", { ref: v, className: g(Be.block, b && Be.disabled, p), ...h, children: [
    (_ || l) && /* @__PURE__ */ r("div", { className: Be.row, children: [
      _ && /* @__PURE__ */ e("span", { className: Be.name, id: `${k}-label`, children: _ }),
      l && /* @__PURE__ */ e("span", { className: Be.readout, children: d ? f(E) : `${f(j)} — ${f(E)}` })
    ] }),
    m && m.length > 0 && /* @__PURE__ */ e("div", { className: Be.hist, "aria-hidden": "true", children: m.map((W, H) => {
      const G = t + (H + 0.5) / m.length * (s - t), ce = Math.max(...m);
      return /* @__PURE__ */ e(
        "span",
        {
          className: g(G >= j && G <= E && Be.histIn),
          style: { height: `${ce ? W / ce * 100 : 0}%` }
        },
        H
      );
    }) }),
    /* @__PURE__ */ r(
      "div",
      {
        ref: y,
        className: Be.range,
        onPointerDown: z,
        onPointerMove: M,
        onPointerUp: () => N(null),
        onPointerCancel: () => N(null),
        children: [
          /* @__PURE__ */ e("div", { className: Be.track }),
          /* @__PURE__ */ e("div", { className: Be.fill, style: { left: `${O}%`, width: `${T - O}%` } }),
          !d && V("low"),
          V("high")
        ]
      }
    ),
    u && /* @__PURE__ */ e("div", { className: Be.ticks, "aria-hidden": "true", children: u.map((W, H) => /* @__PURE__ */ e("span", { children: W }, H)) })
  ] });
}), Wc = "_row_ybety_1", Pc = "_clickable_ybety_16", Fc = "_disabled_ybety_35", Hc = "_leading_ybety_46", Qc = "_leadingFrame_ybety_53", Uc = "_body_ybety_66", Vc = "_title_ybety_72", Gc = "_description_ybety_82", Kc = "_meta_ybety_88", Xc = "_actions_ybety_96", Zc = "_chevron_ybety_103", Yc = "_group_ybety_119", Jc = "_item_ybety_123", Me = {
  row: Wc,
  clickable: Pc,
  disabled: Fc,
  leading: Hc,
  leadingFrame: Qc,
  body: Uc,
  title: Vc,
  description: Gc,
  meta: Kc,
  actions: Xc,
  chevron: Zc,
  group: Yc,
  item: Jc
}, el = /* @__PURE__ */ e(
  "svg",
  {
    className: Me.chevron,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    children: /* @__PURE__ */ e("path", { d: "m9 18 6-6-6-6" })
  }
), In = te(
  function({
    title: t,
    description: s,
    meta: a,
    leading: o,
    leadingFrame: c = !1,
    actions: i,
    href: _,
    target: f,
    rel: l,
    onClick: d,
    disabled: u = !1,
    showChevron: m = !0,
    switchProps: b,
    className: p,
    ...h
  }, v) {
    const k = be(), y = be(), w = !b && (_ != null || d != null), $ = g(
      Me.row,
      w && Me.clickable,
      u && Me.disabled,
      p
    ), C = /* @__PURE__ */ r(He, { children: [
      o != null && /* @__PURE__ */ e("span", { className: g(Me.leading, c && Me.leadingFrame), children: o }),
      /* @__PURE__ */ r("span", { className: Me.body, children: [
        /* @__PURE__ */ e("span", { id: k, className: Me.title, children: t }),
        s != null && /* @__PURE__ */ e("span", { id: y, className: Me.description, children: s }),
        a != null && /* @__PURE__ */ e("span", { className: Me.meta, children: a })
      ] }),
      i != null && /* @__PURE__ */ e("span", { className: Me.actions, children: i }),
      b != null && /* @__PURE__ */ e("span", { className: Me.actions, children: /* @__PURE__ */ e(
        gs,
        {
          "aria-labelledby": k,
          "aria-describedby": s != null ? y : void 0,
          disabled: u || b.disabled,
          ...b
        }
      ) }),
      w && m && el
    ] });
    return w && _ != null ? /* @__PURE__ */ e(
      "a",
      {
        ref: v,
        className: $,
        href: u ? void 0 : _,
        target: f,
        rel: l,
        "aria-disabled": u || void 0,
        tabIndex: u ? -1 : void 0,
        onClick: (N) => {
          if (u) {
            N.preventDefault();
            return;
          }
          d == null || d(N);
        },
        ...h,
        children: C
      }
    ) : w ? /* @__PURE__ */ e(
      "button",
      {
        ref: v,
        type: "button",
        className: $,
        disabled: u,
        onClick: d,
        ...h,
        children: C
      }
    ) : /* @__PURE__ */ e("div", { ref: v, className: $, ...h, children: C });
  }
), jn = te(
  function({ children: t, className: s, ...a }, o) {
    return /* @__PURE__ */ e("div", { ref: o, role: "list", className: g(Me.group, s), ...a, children: Qn.map(
      t,
      (c) => c == null ? c : /* @__PURE__ */ e("div", { role: "listitem", className: Me.item, children: c })
    ) });
  }
), tl = "_root_9qzt8_1", nl = "_layout_9qzt8_6", al = "_visual_9qzt8_11", sl = "_noMap_9qzt8_22", rl = "_controls_9qzt8_37", ol = "_explanation_9qzt8_47", cl = "_lists_9qzt8_55", ll = "_listCard_9qzt8_60", il = "_listHeader_9qzt8_67", dl = "_empty_9qzt8_89", _l = "_summary_9qzt8_96", Ae = {
  root: tl,
  layout: nl,
  visual: al,
  noMap: sl,
  controls: rl,
  explanation: ol,
  lists: cl,
  listCard: ll,
  listHeader: il,
  empty: dl,
  summary: _l
};
function Bv({
  neighborhoods: n,
  baseId: t,
  radius: s,
  defaultRadius: a = 2,
  minRadius: o = 0.5,
  maxRadius: c = 5,
  radiusStep: i = 0.5,
  onRadiusChange: _,
  includedIds: f,
  defaultIncludedIds: l = [],
  onIncludedIdsChange: d,
  map: u,
  mapLabel: m = "Mapa da área de busca",
  error: b,
  className: p
}) {
  const [h, v] = S(a), [k, y] = S(l), w = s ?? h, $ = f ?? k, C = n.find((L) => L.id === t), N = fe(
    () => n.filter((L) => L.id === t || L.distance <= w),
    [n, t, w]
  ), x = N.filter((L) => L.id !== t), j = N.filter((L) => L.id === t || $.includes(L.id)), E = x.filter((L) => !$.includes(L.id));
  function O(L) {
    s === void 0 && v(L), _ == null || _(L);
  }
  function T(L) {
    const I = Array.from(new Set(L.filter((z) => z !== t)));
    f === void 0 && y(I), d == null || d(I);
  }
  function B(L) {
    T($.includes(L) ? $.filter((I) => I !== L) : [...$, L]);
  }
  return /* @__PURE__ */ r("section", { className: g(Ae.root, p), "aria-label": "Seleção da área de busca", children: [
    b && /* @__PURE__ */ e(xt, { tone: "danger", role: "alert", title: "Não foi possível atualizar o mapa", children: b }),
    /* @__PURE__ */ r("div", { className: Ae.layout, children: [
      /* @__PURE__ */ e("div", { className: Ae.visual, "aria-label": m, children: u ?? /* @__PURE__ */ r("div", { className: Ae.noMap, children: [
        /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
          /* @__PURE__ */ e("path", { d: "m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" }),
          /* @__PURE__ */ e("path", { d: "M9 3v15M15 6v15" })
        ] }),
        /* @__PURE__ */ e("strong", { children: "Mapa indisponível" }),
        /* @__PURE__ */ e("span", { children: "Você pode concluir toda a seleção pelas listas ao lado." })
      ] }) }),
      /* @__PURE__ */ r("div", { className: Ae.controls, children: [
        /* @__PURE__ */ e(
          Oc,
          {
            label: `Entorno de ${(C == null ? void 0 : C.label) ?? "área principal"}`,
            min: 0,
            max: c,
            step: i,
            value: [0, w],
            fixedMinimum: !0,
            disabled: !!b,
            formatValue: (L) => `${L.toLocaleString("pt-BR")} km`,
            ticks: ["0", `${c / 2} km`, `${c} km`],
            onChange: ([, L]) => O(Math.max(o, L))
          }
        ),
        /* @__PURE__ */ e(
          Zn,
          {
            label: "Bairros próximos incluídos",
            placeholder: "Adicionar bairro alcançado…",
            options: x.map((L) => ({ value: L.id, label: L.label })),
            value: $.filter((L) => x.some((I) => I.id === L)),
            maxVisibleChips: 2,
            disabled: !!b,
            onChange: T,
            hint: `${x.length} bairro${x.length === 1 ? "" : "s"} no raio atual`
          }
        ),
        /* @__PURE__ */ e("div", { className: Ae.explanation, role: "note", children: "O raio só sugere vizinhos. Apenas os bairros em “Na sua busca” entram no ranking." })
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: Ae.lists, children: [
      /* @__PURE__ */ r("section", { className: Ae.listCard, "aria-labelledby": "geo-included-title", children: [
        /* @__PURE__ */ r("div", { className: Ae.listHeader, children: [
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("h3", { id: "geo-included-title", children: "Na sua busca" }),
            /* @__PURE__ */ e("p", { children: "Somente estes bairros podem trazer imóveis." })
          ] }),
          /* @__PURE__ */ e("span", { children: j.length })
        ] }),
        /* @__PURE__ */ e(jn, { "aria-label": "Bairros incluídos", children: j.map((L) => /* @__PURE__ */ e(
          In,
          {
            title: L.label,
            description: L.id === t ? "Bairro principal" : `${L.distance.toLocaleString("pt-BR")} km do bairro principal`,
            actions: /* @__PURE__ */ e(
              yn,
              {
                "aria-label": L.id === t ? `${L.label} é o bairro principal` : `Remover ${L.label} da busca`,
                selected: !0,
                showCheck: !0,
                disabled: !!b || L.id === t,
                onClick: () => B(L.id),
                children: L.id === t ? "Principal" : "Incluído"
              }
            )
          },
          L.id
        )) })
      ] }),
      /* @__PURE__ */ r("section", { className: Ae.listCard, "aria-labelledby": "geo-excluded-title", children: [
        /* @__PURE__ */ r("div", { className: Ae.listHeader, children: [
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("h3", { id: "geo-excluded-title", children: "Fora da busca" }),
            /* @__PURE__ */ e("p", { children: "Estão no raio, mas não serão usados no ranking." })
          ] }),
          /* @__PURE__ */ e("span", { children: E.length })
        ] }),
        E.length ? /* @__PURE__ */ e(jn, { "aria-label": "Bairros excluídos", children: E.map((L) => /* @__PURE__ */ e(
          In,
          {
            title: L.label,
            description: `${L.distance.toLocaleString("pt-BR")} km do bairro principal`,
            actions: /* @__PURE__ */ e(
              yn,
              {
                "aria-label": `Incluir ${L.label} na busca`,
                disabled: !!b,
                onClick: () => B(L.id),
                children: "Incluir"
              }
            )
          },
          L.id
        )) }) : /* @__PURE__ */ e("p", { className: Ae.empty, children: "Todos os bairros alcançados estão na busca." })
      ] })
    ] }),
    /* @__PURE__ */ r("p", { className: Ae.summary, "aria-live": "polite", children: [
      "Busca em ",
      j.map((L) => L.label).join(", ") || "nenhum bairro",
      "; ",
      E.length,
      " deixado",
      E.length === 1 ? "" : "s",
      " de fora."
    ] })
  ] });
}
const ul = "_skel_1mps2_1", ml = "_circle_1mps2_14", En = {
  skel: ul,
  circle: ml
};
function ea({ width: n = "100%", height: t = 14, circle: s, className: a, style: o, ...c }) {
  return /* @__PURE__ */ e(
    "span",
    {
      "aria-hidden": "true",
      className: g(En.skel, s && En.circle, a),
      style: {
        width: n,
        height: s ? n : t,
        ...o
      },
      ...c
    }
  );
}
const hl = "_root_clpjz_1", pl = "_image_clpjz_17", fl = "_cover_clpjz_24", bl = "_contain_clpjz_25", gl = "_loading_clpjz_27", vl = "_error_clpjz_28", yl = "_arrow_clpjz_46", kl = "_previous_clpjz_60", Nl = "_next_clpjz_61", $l = "_dots_clpjz_63", wl = "_dot_clpjz_63", xl = "_activeDot_clpjz_91", Cl = "_counter_clpjz_93", Se = {
  root: hl,
  image: pl,
  cover: fl,
  contain: bl,
  loading: gl,
  error: vl,
  arrow: yl,
  previous: kl,
  next: Nl,
  dots: $l,
  dot: wl,
  activeDot: xl,
  counter: Cl
}, Ll = /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "m15 18-6-6 6-6" }) }), zl = /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "m9 18 6-6-6-6" }) });
function Ml({
  items: n,
  index: t,
  defaultIndex: s = 0,
  onIndexChange: a,
  aspectRatio: o = "4 / 3",
  fit: c = "cover",
  loading: i = !1,
  errorMessage: _,
  onRetry: f,
  className: l,
  onKeyDown: d,
  ...u
}) {
  const [m, b] = S(s), [p, h] = S("loading"), v = Math.max(0, n.length - 1), k = Math.min(Math.max(t ?? m, 0), v), y = n[k];
  J(() => h("loading"), [y == null ? void 0 : y.src]);
  function w(x) {
    if (n.length === 0) return;
    const j = (x + n.length) % n.length;
    t === void 0 && b(j), a == null || a(j);
  }
  function $(x) {
    d == null || d(x), !(x.defaultPrevented || n.length < 2) && (x.key === "ArrowLeft" && (x.preventDefault(), w(k - 1)), x.key === "ArrowRight" && (x.preventDefault(), w(k + 1)));
  }
  const C = !!_ || p === "error" || n.length === 0, N = i || !C && p === "loading";
  return /* @__PURE__ */ r(
    "div",
    {
      className: g(Se.root, Se[c], l),
      style: { aspectRatio: o },
      role: "region",
      "aria-label": "Fotos do imóvel",
      "aria-roledescription": "carrossel",
      "aria-busy": N || void 0,
      tabIndex: n.length > 1 && !C ? 0 : void 0,
      onKeyDown: $,
      ...u,
      children: [
        y && !C && /* @__PURE__ */ e(
          "img",
          {
            className: Se.image,
            src: y.src,
            alt: y.alt,
            onLoad: () => h("ready"),
            onError: () => h("error")
          },
          y.src
        ),
        N && /* @__PURE__ */ e("div", { className: Se.loading, "aria-label": "Carregando foto", children: /* @__PURE__ */ e(ea, { width: "100%", height: "100%" }) }),
        C && /* @__PURE__ */ e("div", { className: Se.error, children: /* @__PURE__ */ e(
          xt,
          {
            tone: "danger",
            role: "alert",
            title: "Foto indisponível",
            action: f ? /* @__PURE__ */ e(oe, { size: "sm", variant: "danger", onClick: f, children: "Tentar novamente" }) : void 0,
            children: _ ?? "Não foi possível carregar esta imagem."
          }
        ) }),
        n.length > 1 && !C && /* @__PURE__ */ r(He, { children: [
          /* @__PURE__ */ e(ge, { className: g(Se.arrow, Se.previous), variant: "outline", size: "lg", "aria-label": "Foto anterior", icon: Ll, onClick: () => w(k - 1) }),
          /* @__PURE__ */ e(ge, { className: g(Se.arrow, Se.next), variant: "outline", size: "lg", "aria-label": "Próxima foto", icon: zl, onClick: () => w(k + 1) }),
          /* @__PURE__ */ e("div", { className: Se.dots, role: "group", "aria-label": "Escolher foto", children: n.map((x, j) => /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: g(Se.dot, j === k && Se.activeDot),
              "aria-label": `Mostrar foto ${j + 1} de ${n.length}`,
              "aria-current": j === k ? "true" : void 0,
              onClick: () => w(j)
            },
            `${x.src}-${j}`
          )) })
        ] }),
        !C && n.length > 1 && /* @__PURE__ */ r("span", { className: Se.counter, "aria-live": "polite", children: [
          "Foto ",
          k + 1,
          " de ",
          n.length
        ] })
      ]
    }
  );
}
const Dl = "_root_1do9d_1", Il = "_actions_1do9d_7", jl = "_action_1do9d_7", El = "_reject_1do9d_32", Bl = "_save_1do9d_33", Al = "_visit_1do9d_35", Sl = "_active_1do9d_37", Rl = "_status_1do9d_39", Tl = "_vertical_1do9d_46", ql = "_auto_1do9d_49", Lt = {
  root: Dl,
  actions: Il,
  action: jl,
  reject: El,
  save: Bl,
  visit: Al,
  active: Sl,
  status: Rl,
  vertical: Tl,
  auto: ql
}, Ol = {
  reject: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M18 6 6 18M6 6l12 12" }) }),
  save: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" }) }),
  visit: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ e("rect", { x: "3", y: "5", width: "18", height: "16", rx: "2" }),
    /* @__PURE__ */ e("path", { d: "M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" })
  ] })
}, ln = {
  reject: "Não quero",
  save: "Guardar",
  visit: "Quero visitar"
};
function ta({
  state: n = "idle",
  activeAction: t,
  onAction: s,
  orientation: a = "auto",
  disabledActions: o = [],
  statusMessage: c,
  className: i,
  ..._
}) {
  const f = ["reject", "save", "visit"], l = n === "unavailable";
  function d(m) {
    return t !== m ? "idle" : n === "processing" ? "loading" : n === "completed" ? "success" : "idle";
  }
  const u = c ?? (n === "processing" && t ? `${ln[t]}: processando…` : n === "completed" && t ? `${ln[t]}: concluído.` : l ? "As ações deste imóvel estão indisponíveis." : "Escolha o que deseja fazer com este imóvel.");
  return /* @__PURE__ */ r("div", { className: g(Lt.root, Lt[a], i), ..._, children: [
    /* @__PURE__ */ e("div", { className: Lt.actions, role: "group", "aria-label": "Classificar imóvel", children: f.map((m) => {
      const b = m === t;
      return /* @__PURE__ */ e(
        oe,
        {
          className: g(Lt.action, Lt[m], b && Lt.active),
          variant: m === "visit" ? "primary" : "secondary",
          status: d(m),
          loadingLabel: ln[m],
          leadingIcon: Ol[m],
          disabled: l || o.includes(m) || n !== "idle" && !b,
          "aria-pressed": b || void 0,
          onClick: () => s == null ? void 0 : s(m),
          children: ln[m]
        },
        m
      );
    }) }),
    /* @__PURE__ */ e("span", { className: Lt.status, role: "status", "aria-live": "polite", children: u })
  ] });
}
const Wl = "_gauge_tlbzu_1", Pl = "_sm_tlbzu_8", Fl = "_md_tlbzu_9", Hl = "_lg_tlbzu_10", Ql = "_svg_tlbzu_12", Ul = "_track_tlbzu_19", Vl = "_arc_tlbzu_20", Gl = "_center_tlbzu_45", Kl = "_value_tlbzu_56", Xl = "_label_tlbzu_68", ct = {
  gauge: Wl,
  sm: Pl,
  md: Fl,
  lg: Hl,
  svg: Ql,
  track: Ul,
  arc: Vl,
  "band-ok": "_band-ok_tlbzu_40",
  "band-warn": "_band-warn_tlbzu_41",
  "band-critical": "_band-critical_tlbzu_42",
  center: Gl,
  value: Kl,
  label: Xl
}, kn = 28, Bn = 2 * Math.PI * kn;
function Zl(n, t = 70, s = 40) {
  return n >= t ? "ok" : n >= s ? "warn" : "critical";
}
const Yl = (n) => Math.min(100, Math.max(0, n));
function An() {
  return typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
const Jl = te(function({
  value: t,
  label: s,
  size: a = "md",
  okAt: o = 70,
  warnAt: c = 40,
  formatValue: i,
  className: _,
  "aria-label": f,
  ...l
}, d) {
  const u = Yl(t), [m, b] = S(() => An() ? u : 0);
  J(() => {
    if (An()) {
      b(u);
      return;
    }
    const y = requestAnimationFrame(() => b(u));
    return () => cancelAnimationFrame(y);
  }, [u]);
  const p = Zl(u, o, c), h = Bn * (1 - m / 100), v = i ? i(u) : Math.round(u);
  return /* @__PURE__ */ r(
    "div",
    {
      ref: d,
      role: "meter",
      "aria-label": f ?? (typeof s == "string" ? s : "Score"),
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": u,
      className: g(ct.gauge, ct[a], ct[`band-${p}`], _),
      ...l,
      children: [
        /* @__PURE__ */ r("svg", { className: ct.svg, viewBox: "0 0 64 64", "aria-hidden": "true", children: [
          /* @__PURE__ */ e("circle", { className: ct.track, cx: "32", cy: "32", r: kn }),
          /* @__PURE__ */ e(
            "circle",
            {
              className: ct.arc,
              cx: "32",
              cy: "32",
              r: kn,
              strokeDasharray: Bn,
              strokeDashoffset: h
            }
          )
        ] }),
        /* @__PURE__ */ r("span", { className: ct.center, "aria-hidden": "true", children: [
          /* @__PURE__ */ e("span", { className: ct.value, children: v }),
          s != null && /* @__PURE__ */ e("span", { className: ct.label, children: s })
        ] })
      ]
    }
  );
}), ei = "_card_k48f4_1", ti = "_media_k48f4_8", ni = "_badges_k48f4_11", ai = "_content_k48f4_22", si = "_headingRow_k48f4_30", ri = "_headingCopy_k48f4_31", oi = "_title_k48f4_32", ci = "_address_k48f4_40", li = "_headerAction_k48f4_41", ii = "_compatibility_k48f4_42", di = "_price_k48f4_45", _i = "_facts_k48f4_48", ui = "_fact_k48f4_48", mi = "_summary_k48f4_61", hi = "_details_k48f4_71", pi = "_actions_k48f4_73", fi = "_grid_k48f4_75", bi = "_list_k48f4_78", gi = "_deck_k48f4_84", he = {
  card: ei,
  media: ti,
  badges: ni,
  content: ai,
  headingRow: si,
  headingCopy: ri,
  title: oi,
  address: ci,
  headerAction: li,
  compatibility: ii,
  price: di,
  facts: _i,
  fact: ui,
  summary: mi,
  details: hi,
  actions: pi,
  grid: fi,
  list: bi,
  deck: gi
};
function vi({
  title: n,
  address: t,
  price: s,
  priceSuffix: a,
  media: o,
  mediaProps: c,
  layout: i = "grid",
  matchScore: _,
  badges: f = [],
  facts: l = [],
  summary: d,
  actions: u,
  headerAction: m,
  detailsAction: b,
  className: p
}) {
  const h = be(), v = u !== !1 && (i === "deck" || u != null);
  return /* @__PURE__ */ r(
    Xn,
    {
      className: g(he.card, he[i], p),
      padding: "none",
      elevation: i === "deck" ? 3 : 1,
      role: "article",
      "aria-labelledby": h,
      children: [
        /* @__PURE__ */ r("div", { className: he.media, children: [
          /* @__PURE__ */ e(Ml, { ...c, items: o, aspectRatio: (c == null ? void 0 : c.aspectRatio) ?? (i === "deck" ? "16 / 10" : "4 / 3") }),
          f.length > 0 && /* @__PURE__ */ e("div", { className: he.badges, "aria-label": "Destaques do imóvel", children: f.map((k, y) => /* @__PURE__ */ e(Xe, { tone: k.tone, children: k.label }, y)) })
        ] }),
        /* @__PURE__ */ r("div", { className: he.content, children: [
          /* @__PURE__ */ r("div", { className: he.headingRow, children: [
            /* @__PURE__ */ r("div", { className: he.headingCopy, children: [
              /* @__PURE__ */ e("h3", { id: h, className: he.title, children: n }),
              /* @__PURE__ */ e("p", { className: he.address, children: t })
            ] }),
            _ != null && /* @__PURE__ */ r("div", { className: he.compatibility, "aria-label": `Índice de compatibilidade: ${Math.round(_)}%`, children: [
              /* @__PURE__ */ e(Jl, { value: _, label: "compat.", size: i === "deck" ? "md" : "sm" }),
              /* @__PURE__ */ e("span", { children: "compatibilidade" })
            ] }),
            m && /* @__PURE__ */ e("div", { className: he.headerAction, children: m })
          ] }),
          /* @__PURE__ */ r("p", { className: he.price, children: [
            s,
            a && /* @__PURE__ */ e("small", { children: a })
          ] }),
          l.length > 0 && /* @__PURE__ */ e("dl", { className: he.facts, children: l.map((k, y) => /* @__PURE__ */ r("div", { className: he.fact, children: [
            /* @__PURE__ */ e("dt", { children: k.label }),
            /* @__PURE__ */ e("dd", { children: k.value })
          ] }, `${k.label}-${y}`)) }),
          d && /* @__PURE__ */ e("p", { className: he.summary, children: d }),
          b && /* @__PURE__ */ e("div", { className: he.details, children: b })
        ] }),
        v && /* @__PURE__ */ e(ta, { className: he.actions, ...u })
      ]
    }
  );
}
const yi = "_empty_yfuy9_1", ki = "_bordered_yfuy9_11", Ni = "_icon_yfuy9_16", $i = "_title_yfuy9_31", wi = "_message_yfuy9_39", xi = "_action_yfuy9_47", Bt = {
  empty: yi,
  bordered: ki,
  icon: Ni,
  title: $i,
  message: wi,
  action: xi
};
function na({ icon: n, title: t, message: s, action: a, bordered: o = !0, className: c }) {
  return /* @__PURE__ */ r("div", { className: g(Bt.empty, o && Bt.bordered, c), children: [
    n && /* @__PURE__ */ e("div", { className: Bt.icon, children: n }),
    /* @__PURE__ */ e("h4", { className: Bt.title, children: t }),
    s && /* @__PURE__ */ e("p", { className: Bt.message, children: s }),
    a && /* @__PURE__ */ e("div", { className: Bt.action, children: a })
  ] });
}
const Ci = "_root_jnyz3_1", Li = "_queueMeta_jnyz3_2", zi = "_stage_jnyz3_6", Mi = "_backCard_jnyz3_7", Di = "_backTwo_jnyz3_8", Ii = "_backOne_jnyz3_9", ji = "_current_jnyz3_10", Ei = "_gestureLabel_jnyz3_20", Bi = "_rejectLabel_jnyz3_21", Ai = "_saveLabel_jnyz3_22", Si = "_actions_jnyz3_23", Ri = "_end_jnyz3_24", Ti = "_reduced_jnyz3_26", ve = {
  root: Ci,
  queueMeta: Li,
  stage: zi,
  backCard: Mi,
  backTwo: Di,
  backOne: Ii,
  current: ji,
  "leaving-reject": "_leaving-reject_jnyz3_11",
  "leaving-save": "_leaving-save_jnyz3_12",
  "leaving-visit": "_leaving-visit_jnyz3_13",
  "visit-away": "_visit-away_jnyz3_1",
  gestureLabel: Ei,
  rejectLabel: Bi,
  saveLabel: Ai,
  actions: Si,
  end: Ri,
  reduced: Ti
};
function Av({
  items: n,
  index: t,
  defaultIndex: s = 0,
  onIndexChange: a,
  onAction: o,
  onReset: c,
  gestureEnabled: i = !0,
  motion: _ = "auto",
  className: f
}) {
  const [l, d] = S(s), [u, m] = S(), [b, p] = S(!1), [h, v] = S(0), k = Y(void 0), y = Y(void 0), w = t ?? l, $ = n[w], C = Math.max(0, n.length - w - 1);
  J(() => () => window.clearTimeout(y.current), []), J(() => {
    v(0), m(void 0), p(!1);
  }, [$ == null ? void 0 : $.id]);
  function N(I) {
    if (!$ || b) return;
    m(I), p(!0), v(I === "reject" ? -120 : I === "save" ? 120 : 0);
    const z = _ === "reduced" ? 0 : 280;
    y.current = window.setTimeout(() => {
      o == null || o(I, $);
      const M = w + 1;
      t === void 0 && d(M), a == null || a(M);
    }, z);
  }
  function x(I) {
    !i || b || (k.current = I.clientX, I.currentTarget.setPointerCapture(I.pointerId));
  }
  function j(I) {
    k.current == null || !i || b || v(Math.max(-140, Math.min(140, I.clientX - k.current)));
  }
  function E() {
    k.current != null && (k.current = void 0, h <= -72 ? N("reject") : h >= 72 ? N("save") : v(0));
  }
  function O(I) {
    I.target.closest("button, a, input, textarea, select") || (I.key === "ArrowLeft" ? (I.preventDefault(), N("reject")) : I.key === "ArrowRight" ? (I.preventDefault(), N("save")) : I.key.toLowerCase() === "v" && (I.preventDefault(), N("visit")));
  }
  if (!$)
    return /* @__PURE__ */ e("div", { className: g(ve.end, f), children: /* @__PURE__ */ e(
      na,
      {
        bordered: !0,
        title: "Você viu todos os imóveis desta fila",
        message: "Suas escolhas foram guardadas. Você pode revisar as classificações ou atualizar a busca.",
        action: c ? /* @__PURE__ */ e(oe, { variant: "primary", onClick: c, children: "Recomeçar fila" }) : void 0
      }
    ) });
  const { id: T, ...B } = $, L = h / 28;
  return /* @__PURE__ */ r("section", { className: g(ve.root, _ === "reduced" && ve.reduced, f), "aria-label": "Fila de imóveis", children: [
    /* @__PURE__ */ r("div", { className: ve.queueMeta, children: [
      /* @__PURE__ */ e("strong", { children: "Seu próximo imóvel ideal" }),
      /* @__PURE__ */ r("span", { children: [
        C,
        " depois deste"
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: ve.stage, children: [
      C > 0 && /* @__PURE__ */ e("div", { className: g(ve.backCard, ve.backTwo), "aria-hidden": "true" }),
      C > 0 && /* @__PURE__ */ e("div", { className: g(ve.backCard, ve.backOne), "aria-hidden": "true" }),
      /* @__PURE__ */ r(
        "div",
        {
          className: g(ve.current, b && u && ve[`leaving-${u}`]),
          style: { transform: `translateX(${h}px) rotate(${L}deg)` },
          role: "region",
          "aria-label": `Imóvel ${w + 1} de ${n.length}`,
          tabIndex: 0,
          onKeyDown: O,
          onPointerDown: x,
          onPointerMove: j,
          onPointerUp: E,
          onPointerCancel: E,
          children: [
            /* @__PURE__ */ e(vi, { ...B, layout: "deck", actions: !1 }),
            h <= -32 && /* @__PURE__ */ e("span", { className: g(ve.gestureLabel, ve.rejectLabel), children: "Não quero" }),
            h >= 32 && /* @__PURE__ */ e("span", { className: g(ve.gestureLabel, ve.saveLabel), children: "Guardar" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ e(
      ta,
      {
        className: ve.actions,
        state: b ? "processing" : "idle",
        activeAction: u,
        onAction: N,
        statusMessage: i ? "Use os botões. Arrastar e ← → são atalhos; V agenda uma visita." : "Use os botões para classificar este imóvel."
      }
    )
  ] });
}
const qi = "_wrap_gahdl_1", Oi = "_month_gahdl_12", Wi = "_head_gahdl_15", Pi = "_monthLabel_gahdl_21", Fi = "_nav_gahdl_28", Hi = "_navSpacer_gahdl_41", Qi = "_weekRow_gahdl_43", Ui = "_grid_gahdl_43", Vi = "_weekday_gahdl_48", Gi = "_day_gahdl_61", Ki = "_dayNum_gahdl_76", Xi = "_outside_gahdl_88", Zi = "_today_gahdl_89", Yi = "_selected_gahdl_90", Ji = "_inBand_gahdl_60", ed = "_rangeStart_gahdl_104", td = "_rangeEnd_gahdl_111", nd = "_disabled_gahdl_119", le = {
  wrap: qi,
  month: Oi,
  head: Wi,
  monthLabel: Pi,
  nav: Fi,
  navSpacer: Hi,
  weekRow: Qi,
  grid: Ui,
  weekday: Vi,
  day: Gi,
  dayNum: Ki,
  outside: Xi,
  today: Zi,
  selected: Yi,
  inBand: Ji,
  rangeStart: ed,
  rangeEnd: td,
  disabled: nd
}, At = (n) => new Date(n.getFullYear(), n.getMonth(), n.getDate()), Kt = (n) => new Date(n.getFullYear(), n.getMonth(), 1), St = (n, t) => new Date(n.getFullYear(), n.getMonth() + t, 1), Rt = (n, t) => !!n && !!t && n.getFullYear() === t.getFullYear() && n.getMonth() === t.getMonth() && n.getDate() === t.getDate(), Sn = (n) => !!n && typeof n == "object" && "start" in n;
function ad({
  mode: n = "single",
  value: t,
  defaultValue: s,
  onChange: a,
  numberOfMonths: o = 1,
  month: c,
  defaultMonth: i,
  onMonthChange: _,
  min: f,
  max: l,
  weekStartsOn: d = 0,
  locale: u = "pt-BR",
  className: m
}) {
  const b = { start: null, end: null }, [p, h] = S(
    n === "single" && s instanceof Date ? s : null
  ), [v, k] = S(
    n === "range" && Sn(s) ? s : b
  ), y = t !== void 0 && t instanceof Date ? t : t === null ? null : p, w = t !== void 0 && Sn(t) ? t : v, [$, C] = S(null), N = n === "range" ? w.start : y, [x, j] = S(
    Kt(i ?? N ?? /* @__PURE__ */ new Date())
  ), E = c ? Kt(c) : x, [O, T] = S(N ?? /* @__PURE__ */ new Date()), B = At(/* @__PURE__ */ new Date()), L = f ? At(f) : null, I = l ? At(l) : null, z = (U) => L && U < L || I && U > I || !1, M = fe(() => {
    const U = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (K, R) => {
      const D = new Date(U);
      return D.setDate(U.getDate() + (R + d) % 7), new Intl.DateTimeFormat(u, { weekday: "narrow" }).format(D);
    });
  }, [u, d]);
  function F(U) {
    c || j(U), _ == null || _(U);
  }
  function V(U) {
    if (z(U)) return;
    const K = At(U);
    if (T(K), n === "single") {
      t === void 0 && h(K), a == null || a(K);
      return;
    }
    let R;
    !w.start || w.start && w.end ? R = { start: K, end: null } : K < w.start ? R = { start: K, end: null } : R = { start: w.start, end: K }, t === void 0 && k(R), a == null || a(R);
  }
  function W(U) {
    const K = new Date(O);
    K.setDate(O.getDate() + U), T(K), (K < Kt(E) || K >= St(E, o)) && F(Kt(K));
  }
  function H(U) {
    switch (U.key) {
      case "ArrowLeft":
        U.preventDefault(), W(-1);
        break;
      case "ArrowRight":
        U.preventDefault(), W(1);
        break;
      case "ArrowUp":
        U.preventDefault(), W(-7);
        break;
      case "ArrowDown":
        U.preventDefault(), W(7);
        break;
      case "PageUp":
        U.preventDefault(), F(St(E, -1));
        break;
      case "PageDown":
        U.preventDefault(), F(St(E, 1));
        break;
      case "Enter":
      case " ":
        U.preventDefault(), V(O);
        break;
    }
  }
  const G = n === "range" && w.start && !w.end ? $ : null;
  function ce(U) {
    if (n === "single")
      return { isSel: Rt(U, y), isStart: !1, isEnd: !1, inBand: !1 };
    const { start: K, end: R } = w, D = R ?? G, A = K, P = D && K && D < K ? K : D, Q = Rt(U, K), Z = Rt(U, R) || !R && Rt(U, G), ie = !!A && !!P && U > At(A) && U < At(P);
    return { isSel: Q || Z, isStart: Q, isEnd: Z, inBand: ie };
  }
  function ue(U, K) {
    const R = (() => {
      const Z = new Intl.DateTimeFormat(u, { month: "long", year: "numeric" }).format(U);
      return Z.charAt(0).toUpperCase() + Z.slice(1);
    })(), D = Kt(U), A = (D.getDay() - d + 7) % 7, P = new Date(D);
    P.setDate(D.getDate() - A);
    const Q = Array.from({ length: 42 }, (Z, ie) => {
      const me = new Date(P);
      return me.setDate(P.getDate() + ie), me;
    });
    return /* @__PURE__ */ r("div", { className: le.month, children: [
      /* @__PURE__ */ r("div", { className: le.head, children: [
        K === 0 ? /* @__PURE__ */ e("button", { type: "button", className: le.nav, "aria-label": "Mês anterior", onClick: () => F(St(E, -1)), children: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "m15 18-6-6 6-6" }) }) }) : /* @__PURE__ */ e("span", { className: le.navSpacer }),
        /* @__PURE__ */ e("span", { className: le.monthLabel, children: R }),
        K === o - 1 ? /* @__PURE__ */ e("button", { type: "button", className: le.nav, "aria-label": "Próximo mês", onClick: () => F(St(E, 1)), children: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "m9 18 6-6-6-6" }) }) }) : /* @__PURE__ */ e("span", { className: le.navSpacer })
      ] }),
      /* @__PURE__ */ e("div", { className: le.weekRow, "aria-hidden": "true", children: M.map((Z, ie) => /* @__PURE__ */ e("span", { className: le.weekday, children: Z }, ie)) }),
      /* @__PURE__ */ e("div", { className: le.grid, role: "grid", onKeyDown: H, children: Q.map((Z) => {
        const ie = Z.getMonth() !== U.getMonth(), me = z(Z), ae = Rt(Z, B), Ie = Rt(Z, O), { isSel: ht, isStart: Ct, isEnd: un, inBand: ra } = ce(Z);
        return /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            role: "gridcell",
            tabIndex: Ie ? 0 : -1,
            "aria-selected": ht,
            "aria-current": ae ? "date" : void 0,
            disabled: me,
            className: g(
              le.day,
              ie && le.outside,
              ra && le.inBand,
              ht && le.selected,
              Ct && n === "range" && le.rangeStart,
              un && n === "range" && le.rangeEnd,
              ae && !ht && le.today,
              me && le.disabled
            ),
            onClick: () => V(Z),
            onMouseEnter: () => n === "range" && C(Z),
            onFocus: () => T(Z),
            children: /* @__PURE__ */ e("span", { className: le.dayNum, children: Z.getDate() })
          },
          Z.toISOString()
        );
      }) })
    ] }, K);
  }
  const Ye = Array.from({ length: o }, (U, K) => St(E, K));
  return /* @__PURE__ */ e(
    "div",
    {
      className: g(le.wrap, o > 1 && le.wrapMulti, m),
      onMouseLeave: () => C(null),
      children: Ye.map((U, K) => ue(U, K))
    }
  );
}
const sd = "_group_tdbxu_1", rd = "_card_tdbxu_7", od = "_selected_tdbxu_36", cd = "_preview_tdbxu_50", ld = "_body_tdbxu_61", id = "_title_tdbxu_68", dd = "_icon_tdbxu_77", _d = "_description_tdbxu_86", ud = "_meta_tdbxu_92", mt = {
  group: sd,
  card: rd,
  selected: od,
  preview: cd,
  body: ld,
  title: id,
  icon: dd,
  description: _d,
  meta: ud
}, aa = Vn(null);
function Rn(n) {
  return n == null ? [] : Array.isArray(n) ? n : [n];
}
function md({
  mode: n = "single",
  value: t,
  defaultValue: s,
  onChange: a,
  label: o,
  columns: c = 3,
  children: i,
  className: _
}) {
  const f = t !== void 0, [l, d] = S(() => Rn(s)), u = f ? Rn(t) : l, m = Y(null), b = Y(null);
  b.current = null;
  const p = Ft(
    ($) => {
      let C;
      n === "single" ? C = [$] : C = u.includes($) ? u.filter((N) => N !== $) : [...u, $], f || d(C), a == null || a(n === "single" ? C[0] ?? "" : C);
    },
    [n, u, f, a]
  ), h = Ft(($) => u.includes($), [u]), v = Ft(($) => {
    b.current == null && (b.current = $);
  }, []), k = Ft(
    ($, C) => C ? -1 : n === "multiple" ? 0 : u.length === 0 ? $ === b.current ? 0 : -1 : h($) ? 0 : -1,
    [n, u, h]
  ), y = ($) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"].includes($.key)) return;
    const N = m.current;
    if (!N) return;
    const x = Array.from(
      N.querySelectorAll("button[data-choice-card]:not(:disabled)")
    );
    if (x.length === 0) return;
    $.preventDefault();
    const j = x.indexOf($.target);
    let E;
    $.key === "Home" ? E = 0 : $.key === "End" ? E = x.length - 1 : $.key === "ArrowRight" || $.key === "ArrowDown" ? E = j < 0 ? 0 : (j + 1) % x.length : E = j < 0 ? 0 : (j - 1 + x.length) % x.length;
    const O = x[E];
    if (O.focus(), n === "single") {
      const T = O.getAttribute("data-value");
      T != null && p(T);
    }
  }, w = fe(
    () => ({ mode: n, isSelected: h, select: p, tabIndexFor: k, noteFirst: v }),
    [n, h, p, k, v]
  );
  return /* @__PURE__ */ e(aa.Provider, { value: w, children: /* @__PURE__ */ e(
    "div",
    {
      ref: m,
      role: n === "single" ? "radiogroup" : "group",
      "aria-label": o,
      className: g(mt.group, _),
      style: { "--choice-columns": c },
      onKeyDown: y,
      children: i
    }
  ) });
}
function hd({
  value: n,
  title: t,
  description: s,
  icon: a,
  preview: o,
  meta: c,
  disabled: i = !1,
  className: _
}) {
  const f = Un(aa);
  if (!f) throw new Error("ChoiceCard deve estar dentro de ChoiceCardGroup.");
  i || f.noteFirst(n);
  const l = f.isSelected(n);
  return /* @__PURE__ */ r(
    "button",
    {
      type: "button",
      role: f.mode === "single" ? "radio" : "checkbox",
      "aria-checked": l,
      "data-choice-card": "",
      "data-value": n,
      tabIndex: f.tabIndexFor(n, i),
      disabled: i,
      className: g(mt.card, l && mt.selected, _),
      onClick: () => f.select(n),
      children: [
        o != null && /* @__PURE__ */ e("span", { className: mt.preview, children: o }),
        /* @__PURE__ */ r("span", { className: mt.body, children: [
          /* @__PURE__ */ r("span", { className: mt.title, children: [
            a != null && /* @__PURE__ */ e("span", { className: mt.icon, children: a }),
            t
          ] }),
          s != null && /* @__PURE__ */ e("span", { className: mt.description, children: s }),
          c != null && /* @__PURE__ */ e("span", { className: mt.meta, children: c })
        ] })
      ]
    }
  );
}
const pd = "_group_1izo3_1", fd = "_disabled_1izo3_7", bd = "_toggle_1izo3_12", gd = "_on_1izo3_47", vd = "_icon_1izo3_53", Xt = {
  group: pd,
  disabled: fd,
  toggle: bd,
  on: gd,
  icon: vd
};
function yd({
  options: n,
  value: t,
  defaultValue: s = [],
  onChange: a,
  label: o,
  disabled: c,
  className: i
}) {
  const [_, f] = S(s), l = t !== void 0 ? t : _;
  function d(u) {
    if (u.disabled) return;
    const m = l.includes(u.value) ? l.filter((b) => b !== u.value) : [...l, u.value];
    t === void 0 && f(m), a == null || a(m);
  }
  return /* @__PURE__ */ e("div", { role: "group", "aria-label": o, className: g(Xt.group, c && Xt.disabled, i), children: n.map((u) => {
    const m = l.includes(u.value);
    return /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        "aria-pressed": m,
        disabled: c || u.disabled,
        className: g(Xt.toggle, m && Xt.on),
        onClick: () => d(u),
        children: [
          u.icon && /* @__PURE__ */ e("span", { className: Xt.icon, children: u.icon }),
          u.label
        ]
      },
      u.value
    );
  }) });
}
const kd = "_root_2vcac_1", Nd = "_main_2vcac_2", $d = "_calendarWrap_2vcac_3", wd = "_schedule_2vcac_3", xd = "_summary_2vcac_3", Cd = "_sectionHeading_2vcac_5", Ld = "_timesHeading_2vcac_5", zd = "_summaryHeading_2vcac_5", Md = "_days_2vcac_11", Dd = "_times_2vcac_5", Id = "_summaryList_2vcac_15", jd = "_summaryDay_2vcac_16", Ed = "_timezone_2vcac_19", Re = {
  root: kd,
  main: Nd,
  calendarWrap: $d,
  schedule: wd,
  summary: xd,
  sectionHeading: Cd,
  timesHeading: Ld,
  summaryHeading: zd,
  days: Md,
  times: Dd,
  summaryList: Id,
  summaryDay: jd,
  timezone: Ed
};
function Tn(n) {
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}
function dn(n) {
  const [t, s, a] = n.split("-").map(Number);
  return new Date(t, s - 1, a);
}
function Bd(n) {
  const [t, s] = n.split(":").map(Number);
  return t * 60 + s;
}
function qn(n) {
  const t = Math.floor(n / 60), s = n % 60;
  return s === 0 ? `${String(t).padStart(2, "0")}h` : `${String(t).padStart(2, "0")}h${String(s).padStart(2, "0")}`;
}
function Ad(n) {
  const t = Array.from(new Set(n.map(Bd))).sort((c, i) => c - i);
  if (t.length === 0) return [];
  const s = [];
  let a = t[0], o = t[0];
  return t.slice(1).forEach((c) => {
    c === o + 30 ? o = c : (s.push({ start: a, end: o + 30 }), a = o = c);
  }), s.push({ start: a, end: o + 30 }), s.map(({ start: c, end: i }) => `${qn(c)}–${qn(i)}`);
}
const Sd = Array.from({ length: 23 }, (n, t) => {
  const s = 480 + t * 30;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
});
function Sv({
  value: n,
  defaultValue: t = {},
  onChange: s,
  defaultActiveDate: a = /* @__PURE__ */ new Date(),
  minDate: o = /* @__PURE__ */ new Date(),
  maxDate: c,
  timezone: i = "America/Sao_Paulo",
  unavailable: _ = {},
  disabled: f = !1,
  className: l
}) {
  const d = Tn(a), [u, m] = S(() => ({ [d]: [], ...t })), [b, p] = S(() => Object.keys(t)[0] ?? d), h = n ?? u, v = fe(() => Object.keys(h).sort(), [h]);
  function k(N) {
    n === void 0 && m(N), s == null || s(N);
  }
  function y(N) {
    const x = Tn(N);
    p(x), x in h || k({ ...h, [x]: [] });
  }
  function w(N) {
    k({ ...h, [b]: N });
  }
  const $ = Sd.map((N) => {
    var x;
    return {
      value: N,
      label: N,
      disabled: (x = _[b]) == null ? void 0 : x.includes(N)
    };
  }), C = v.filter((N) => {
    var x;
    return (x = h[N]) == null ? void 0 : x.length;
  }).length;
  return /* @__PURE__ */ r("section", { className: g(Re.root, l), "aria-label": "Escolher disponibilidade para visita", children: [
    /* @__PURE__ */ r("div", { className: Re.main, children: [
      /* @__PURE__ */ r("div", { className: Re.calendarWrap, children: [
        /* @__PURE__ */ e("h3", { children: "Escolha os dias" }),
        /* @__PURE__ */ e("p", { children: "Clique em mais de uma data para montar suas alternativas." }),
        /* @__PURE__ */ e(ad, { mode: "single", value: dn(b), min: o, max: c, onChange: (N) => y(N) })
      ] }),
      /* @__PURE__ */ r("div", { className: Re.schedule, children: [
        /* @__PURE__ */ r("div", { className: Re.sectionHeading, children: [
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("h3", { children: "Dias selecionados" }),
            /* @__PURE__ */ e("p", { children: "Alterne o dia para definir horários diferentes." })
          ] }),
          /* @__PURE__ */ r(Xe, { tone: "neutral", children: [
            v.length,
            " dia",
            v.length === 1 ? "" : "s"
          ] })
        ] }),
        /* @__PURE__ */ e(
          md,
          {
            mode: "single",
            value: b,
            onChange: (N) => p(N),
            label: "Dia que está sendo editado",
            columns: Math.min(3, Math.max(1, v.length)),
            className: Re.days,
            children: v.map((N) => {
              var j, E;
              const x = dn(N);
              return /* @__PURE__ */ e(
                hd,
                {
                  value: N,
                  title: new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(x),
                  description: `${((j = h[N]) == null ? void 0 : j.length) ?? 0} horário${((E = h[N]) == null ? void 0 : E.length) === 1 ? "" : "s"}`
                },
                N
              );
            })
          }
        ),
        /* @__PURE__ */ r("div", { className: Re.timesHeading, children: [
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("h3", { children: "Horários disponíveis" }),
            /* @__PURE__ */ e("p", { children: "Das 08h às 19h, em intervalos de 30 minutos." })
          ] }),
          /* @__PURE__ */ r(Xe, { tone: "info", children: [
            "fuso ",
            i
          ] })
        ] }),
        /* @__PURE__ */ e(
          yd,
          {
            className: Re.times,
            label: `Horários de ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(dn(b))}`,
            options: $,
            value: h[b] ?? [],
            onChange: w,
            disabled: f
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("aside", { className: Re.summary, "aria-labelledby": "visit-summary-title", children: [
      /* @__PURE__ */ r("div", { className: Re.summaryHeading, children: [
        /* @__PURE__ */ r("div", { children: [
          /* @__PURE__ */ e("h3", { id: "visit-summary-title", children: "Sua disponibilidade" }),
          /* @__PURE__ */ e("p", { children: "O corretor confirmará um destes intervalos." })
        ] }),
        /* @__PURE__ */ r(Xe, { tone: C ? "success" : "neutral", children: [
          C,
          " com horário"
        ] })
      ] }),
      /* @__PURE__ */ e("div", { className: Re.summaryList, "aria-live": "polite", children: v.map((N) => {
        const x = Ad(h[N] ?? []);
        return /* @__PURE__ */ r("div", { className: Re.summaryDay, children: [
          /* @__PURE__ */ e("strong", { children: new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short" }).format(dn(N)) }),
          /* @__PURE__ */ e("span", { children: x.length ? x.join(" · ") : "Escolha os horários" })
        ] }, N);
      }) }),
      /* @__PURE__ */ r("p", { className: Re.timezone, children: [
        "Horários exibidos em ",
        i,
        "."
      ] })
    ] })
  ] });
}
const Rd = "_root_n2ke2_1", Td = "_good_n2ke2_8", qd = "_ok_n2ke2_11", Od = "_warn_n2ke2_14", Wd = "_critical_n2ke2_17", Pd = "_info_n2ke2_20", Fd = "_neutral_n2ke2_23", Hd = "_dot_n2ke2_27", Qd = "_label_n2ke2_36", Ud = "_pulse_n2ke2_50", Zt = {
  root: Rd,
  good: Td,
  ok: qd,
  warn: Od,
  critical: Wd,
  info: Pd,
  neutral: Fd,
  dot: Hd,
  label: Qd,
  pulse: Ud,
  "statusdot-pulse": "_statusdot-pulse_n2ke2_1"
};
function On({
  tone: n = "good",
  pulse: t = !1,
  className: s,
  children: a,
  ...o
}) {
  return /* @__PURE__ */ r("span", { className: g(Zt.root, Zt[n], s), ...o, children: [
    /* @__PURE__ */ e("span", { className: g(Zt.dot, t && Zt.pulse), "aria-hidden": "true" }),
    a != null && /* @__PURE__ */ e("span", { className: Zt.label, children: a })
  ] });
}
const Vd = "_root_175n6_1", Gd = "_contextHeader_175n6_2", Kd = "_group_175n6_5", Xd = "_dateRow_175n6_6", Zd = "_list_175n6_8", Yd = "_item_175n6_9", Jd = "_marker_175n6_11", e_ = "_event_175n6_13", t_ = "_eventHead_175n6_14", n_ = "_copy_175n6_15", a_ = "_titleRow_175n6_16", s_ = "_meta_175n6_18", r_ = "_description_175n6_21", o_ = "_action_175n6_22", c_ = "_compact_175n6_24", Ne = {
  root: Vd,
  contextHeader: Gd,
  group: Kd,
  dateRow: Xd,
  list: Zd,
  item: Yd,
  marker: Jd,
  event: e_,
  eventHead: t_,
  copy: n_,
  titleRow: a_,
  meta: s_,
  description: r_,
  action: o_,
  compact: c_
};
function Rv({
  title: n = "Histórico de interações",
  context: t = "Eventos deste relacionamento em ordem cronológica.",
  events: s,
  locale: a = "pt-BR",
  timezone: o = "America/Sao_Paulo",
  error: c,
  onRetry: i,
  emptyTitle: _ = "Nenhum evento ainda",
  emptyMessage: f = "As atividades aparecerão aqui quando acontecerem.",
  density: l = "default",
  showHeader: d = !0,
  className: u
}) {
  const m = fe(() => [...s].sort((p, h) => new Date(h.timestamp).getTime() - new Date(p.timestamp).getTime()).reduce((p, h) => {
    const v = new Date(h.timestamp), k = new Intl.DateTimeFormat("en-CA", { timeZone: o, year: "numeric", month: "2-digit", day: "2-digit" }).format(v), y = p.find((w) => w.key === k);
    return y ? y.items.push(h) : p.push({ key: k, date: v, items: [h] }), p;
  }, []), [s, o]);
  return c ? /* @__PURE__ */ e(
    xt,
    {
      className: u,
      tone: "danger",
      role: "alert",
      title: "Não foi possível carregar o histórico",
      action: i ? /* @__PURE__ */ e(oe, { size: "sm", variant: "danger", onClick: i, children: "Tentar novamente" }) : void 0,
      children: c
    }
  ) : s.length === 0 ? /* @__PURE__ */ e(na, { className: u, title: _, message: f }) : /* @__PURE__ */ r("div", { className: g(Ne.root, l === "compact" && Ne.compact, u), "aria-label": "Histórico de eventos", children: [
    d && /* @__PURE__ */ r("header", { className: Ne.contextHeader, children: [
      /* @__PURE__ */ e("h2", { children: n }),
      /* @__PURE__ */ e("p", { children: t })
    ] }),
    m.map((b) => /* @__PURE__ */ r("section", { className: Ne.group, "aria-labelledby": `timeline-${b.key}`, children: [
      /* @__PURE__ */ r("div", { className: Ne.dateRow, children: [
        /* @__PURE__ */ e("h3", { id: `timeline-${b.key}`, children: new Intl.DateTimeFormat(a, { weekday: "long", day: "2-digit", month: "long", timeZone: o }).format(b.date) }),
        /* @__PURE__ */ r(Xe, { tone: "neutral", children: [
          b.items.length,
          " evento",
          b.items.length === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ e("ol", { className: Ne.list, children: b.items.map((p) => {
        var v, k, y;
        const h = new Date(p.timestamp);
        return /* @__PURE__ */ r("li", { className: Ne.item, children: [
          /* @__PURE__ */ e("div", { className: Ne.marker, children: p.actor ? /* @__PURE__ */ e(Ze, { size: "md", initials: p.actor.initials ?? p.actor.name.slice(0, 2).toUpperCase(), src: p.actor.src, alt: p.actor.name, seed: p.actor.seed ?? p.actor.name }) : /* @__PURE__ */ e(On, { tone: ((v = p.status) == null ? void 0 : v.tone) ?? "neutral", pulse: (k = p.status) == null ? void 0 : k.pulse, "aria-label": typeof ((y = p.status) == null ? void 0 : y.label) == "string" ? p.status.label : "Evento" }) }),
          /* @__PURE__ */ r("article", { className: Ne.event, children: [
            /* @__PURE__ */ r("div", { className: Ne.eventHead, children: [
              /* @__PURE__ */ r("div", { className: Ne.copy, children: [
                /* @__PURE__ */ r("div", { className: Ne.titleRow, children: [
                  /* @__PURE__ */ e("h4", { children: p.title }),
                  p.badge && /* @__PURE__ */ e(Xe, { tone: p.badge.tone, children: p.badge.label })
                ] }),
                /* @__PURE__ */ r("p", { className: Ne.meta, children: [
                  /* @__PURE__ */ e("time", { dateTime: h.toISOString(), children: new Intl.DateTimeFormat(a, { hour: "2-digit", minute: "2-digit", timeZone: o }).format(h) }),
                  p.actor && /* @__PURE__ */ r("span", { children: [
                    "por ",
                    p.actor.href ? /* @__PURE__ */ e("a", { href: p.actor.href, target: p.actor.target, children: p.actor.name }) : p.actor.name
                  ] }),
                  p.status && /* @__PURE__ */ e(On, { tone: p.status.tone, pulse: p.status.pulse, children: p.status.label })
                ] })
              ] }),
              p.action && /* @__PURE__ */ e("div", { className: Ne.action, children: p.action })
            ] }),
            p.description && /* @__PURE__ */ e("div", { className: Ne.description, children: p.description })
          ] })
        ] }, p.id);
      }) })
    ] }, b.key))
  ] });
}
const l_ = "_root_gv2zn_1", i_ = "_input_gv2zn_2", d_ = "_dropzone_gv2zn_3", __ = "_dragging_gv2zn_4", u_ = "_disabled_gv2zn_5", m_ = "_icon_gv2zn_6", h_ = "_copy_gv2zn_8", p_ = "_files_gv2zn_11", f_ = "_file_gv2zn_11", b_ = "_preview_gv2zn_13", g_ = "_fileTypeIcon_gv2zn_15", v_ = "_fileTypeLabel_gv2zn_17", y_ = "_previewExtension_gv2zn_18", k_ = "_fileCopy_gv2zn_21", N_ = "_fileActions_gv2zn_25", $_ = "_status_gv2zn_26", ye = {
  root: l_,
  input: i_,
  dropzone: d_,
  dragging: __,
  disabled: u_,
  icon: m_,
  copy: h_,
  files: p_,
  file: f_,
  preview: b_,
  fileTypeIcon: g_,
  fileTypeLabel: v_,
  previewExtension: y_,
  fileCopy: k_,
  fileActions: N_,
  status: $_
}, w_ = /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M12 16V4m0 0L7 9m5-5 5 5M5 15v4h14v-4" }) }), x_ = /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M18 6 6 18M6 6l12 12" }) }), C_ = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ e("path", { d: "M6 3h8l4 4v14H6V3Z" }),
  /* @__PURE__ */ e("path", { d: "M14 3v5h5M9 12h6M9 16h6" })
] }), L_ = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ e("rect", { x: "4", y: "4", width: "16", height: "16", rx: "1" }),
  /* @__PURE__ */ e("path", { d: "M4 9h16M9 4v16M15 4v16M4 14h16" })
] }), z_ = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ e("path", { d: "M6 3h8l4 4v14H6V3Z" }),
  /* @__PURE__ */ e("path", { d: "M14 3v5h5" })
] });
function M_(n) {
  var a;
  const t = ((a = n.name.split(".").pop()) == null ? void 0 : a.toLocaleLowerCase("pt-BR")) ?? "", s = t ? t.toLocaleUpperCase("pt-BR") : "ARQ";
  return ["xls", "xlsx", "csv"].includes(t) ? { kind: "spreadsheet", label: s, icon: L_ } : ["doc", "docx", "odt", "pdf"].includes(t) ? { kind: "document", label: s, icon: C_ } : { kind: "file", label: s, icon: z_ };
}
function Tv({
  files: n,
  defaultFiles: t = [],
  onFilesChange: s,
  accept: a,
  multiple: o = !1,
  maxSize: c = 10 * 1024 * 1024,
  state: i = "idle",
  progress: _,
  errorMessage: f,
  disabled: l = !1,
  label: d = "Adicionar arquivos",
  hint: u = "Arraste arquivos para cá ou escolha no seu dispositivo.",
  className: m
}) {
  const b = be(), p = Y(null), [h, v] = S(t), [k, y] = S(), [w, $] = S(!1), [C, N] = S({}), x = n ?? h, j = i === "uploading";
  J(() => {
    const z = {};
    return x.forEach((M) => {
      M.type.startsWith("image/") && (z[`${M.name}-${M.lastModified}`] = URL.createObjectURL(M));
    }), N(z), () => Object.values(z).forEach(URL.revokeObjectURL);
  }, [x]);
  function E(z) {
    n === void 0 && v(z), s == null || s(z);
  }
  function O(z) {
    const M = z.find((F) => F.size > c);
    if (M) {
      y(`${M.name} excede o limite de ${(c / 1024 / 1024).toLocaleString("pt-BR")} MB.`);
      return;
    }
    y(void 0), E(o ? [...x, ...z] : z.slice(0, 1));
  }
  function T(z) {
    O(Array.from(z.target.files ?? [])), z.target.value = "";
  }
  function B(z) {
    z.preventDefault(), $(!1), !l && !j && O(Array.from(z.dataTransfer.files));
  }
  function L(z) {
    E(x.filter((M, F) => F !== z));
  }
  const I = f ?? k;
  return /* @__PURE__ */ r("section", { className: g(ye.root, m), "aria-label": d, "aria-busy": j || void 0, children: [
    /* @__PURE__ */ e("input", { ref: p, id: b, className: ye.input, type: "file", accept: a, multiple: o, disabled: l || j, onChange: T }),
    (o || x.length === 0) && /* @__PURE__ */ r(
      "div",
      {
        className: g(ye.dropzone, w && ye.dragging, l && ye.disabled),
        onDragEnter: (z) => {
          z.preventDefault(), !l && !j && $(!0);
        },
        onDragOver: (z) => z.preventDefault(),
        onDragLeave: () => $(!1),
        onDrop: B,
        children: [
          /* @__PURE__ */ e("div", { className: ye.icon, children: w_ }),
          /* @__PURE__ */ r("div", { className: ye.copy, children: [
            /* @__PURE__ */ e("strong", { children: d }),
            /* @__PURE__ */ e("span", { children: u })
          ] }),
          /* @__PURE__ */ r(oe, { variant: "secondary", disabled: l || j, onClick: () => {
            var z;
            return (z = p.current) == null ? void 0 : z.click();
          }, children: [
            "Escolher arquivo",
            o ? "s" : ""
          ] })
        ]
      }
    ),
    I && /* @__PURE__ */ e(xt, { tone: "danger", role: "alert", title: "Arquivo não adicionado", children: I }),
    x.length > 0 && /* @__PURE__ */ e("ul", { className: ye.files, "aria-label": "Arquivos selecionados", children: x.map((z, M) => {
      const F = C[`${z.name}-${z.lastModified}`], V = M_(z);
      return /* @__PURE__ */ r("li", { className: ye.file, children: [
        /* @__PURE__ */ e("div", { className: ye.preview, "data-kind": V.kind, "aria-hidden": "true", children: F ? /* @__PURE__ */ r(He, { children: [
          /* @__PURE__ */ e("img", { src: F, alt: "" }),
          /* @__PURE__ */ e("span", { className: ye.previewExtension, children: V.label })
        ] }) : /* @__PURE__ */ r(He, { children: [
          /* @__PURE__ */ e("span", { className: ye.fileTypeIcon, children: V.icon }),
          /* @__PURE__ */ e("span", { className: ye.fileTypeLabel, children: V.label })
        ] }) }),
        /* @__PURE__ */ r("div", { className: ye.fileCopy, children: [
          /* @__PURE__ */ e("strong", { children: z.name }),
          /* @__PURE__ */ r("span", { children: [
            (z.size / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
            " KB"
          ] }),
          j && /* @__PURE__ */ e(jt, { value: _, indeterminate: _ === void 0, size: "sm", "aria-label": `Upload de ${z.name}` })
        ] }),
        /* @__PURE__ */ r("div", { className: ye.fileActions, children: [
          i === "success" && /* @__PURE__ */ e(Xe, { tone: "success", children: "Enviado" }),
          /* @__PURE__ */ e(ge, { "aria-label": `Remover ${z.name}`, icon: x_, size: "sm", disabled: j || l, onClick: () => L(M) })
        ] })
      ] }, `${z.name}-${z.lastModified}-${M}`);
    }) }),
    /* @__PURE__ */ e("span", { className: ye.status, role: "status", "aria-live": "polite", children: j ? _ === void 0 ? `Enviando ${x.length} arquivo${x.length === 1 ? "" : "s"}.` : `Enviando ${x.length} arquivo${x.length === 1 ? "" : "s"}: ${Math.round(_)}%.` : i === "success" ? "Upload concluído." : `${x.length} arquivo${x.length === 1 ? "" : "s"} selecionado${x.length === 1 ? "" : "s"}.` })
  ] });
}
const D_ = "_field_bq3pl_1", I_ = "_label_bq3pl_2", j_ = "_shell_bq3pl_3", E_ = "_input_bq3pl_5", B_ = "_countryPicker_bq3pl_6", A_ = "_country_bq3pl_6", S_ = "_countryCaret_bq3pl_8", R_ = "_disabled_bq3pl_11", T_ = "_hasError_bq3pl_12", q_ = "_help_bq3pl_13", O_ = "_helpError_bq3pl_14", Ue = {
  field: D_,
  label: I_,
  shell: j_,
  input: E_,
  countryPicker: B_,
  country: A_,
  countryCaret: S_,
  disabled: R_,
  hasError: T_,
  help: q_,
  helpError: O_
}, W_ = [
  { code: "AR", name: "Argentina", callingCode: "+54", flag: "🇦🇷" },
  { code: "BR", name: "Brasil", callingCode: "+55", flag: "🇧🇷" },
  { code: "CL", name: "Chile", callingCode: "+56", flag: "🇨🇱" },
  { code: "US", name: "Estados Unidos", callingCode: "+1", flag: "🇺🇸" },
  { code: "PY", name: "Paraguai", callingCode: "+595", flag: "🇵🇾" },
  { code: "PT", name: "Portugal", callingCode: "+351", flag: "🇵🇹" },
  { code: "UY", name: "Uruguai", callingCode: "+598", flag: "🇺🇾" }
];
function Wn(n) {
  const t = n.replace(/\D/g, "").slice(0, 11);
  return t.length <= 2 ? t.replace(/^(\d+)/, "($1") : t.length <= 6 ? t.replace(/^(\d{2})(\d+)/, "($1) $2") : t.length <= 10 ? t.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3") : t.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}
const qv = te(function({
  label: t,
  hint: s,
  error: a,
  country: o = "BR",
  countries: c = W_,
  onCountryChange: i,
  className: _,
  id: f,
  disabled: l,
  onChange: d,
  value: u,
  ...m
}, b) {
  const p = be(), h = f ?? `${p}-phone`, v = a || s ? `${h}-help` : void 0, k = c.find((y) => y.code === o) ?? c[0];
  return /* @__PURE__ */ r("div", { className: g(Ue.field, _), children: [
    t && /* @__PURE__ */ e("label", { className: Ue.label, htmlFor: h, children: t }),
    /* @__PURE__ */ r("div", { className: g(Ue.shell, a && Ue.hasError, l && Ue.disabled), children: [
      /* @__PURE__ */ r("div", { className: Ue.countryPicker, children: [
        /* @__PURE__ */ e("span", { "aria-hidden": "true", children: k.flag }),
        /* @__PURE__ */ e("span", { className: Ue.countryCaret, "aria-hidden": "true", children: "⌄" }),
        /* @__PURE__ */ e(
          "select",
          {
            className: Ue.country,
            value: o,
            disabled: l,
            "aria-label": "País e código internacional",
            onChange: (y) => {
              const w = c.find(($) => $.code === y.target.value);
              w && (i == null || i(w));
            },
            children: c.map((y) => /* @__PURE__ */ r("option", { value: y.code, children: [
              y.name,
              " · ",
              y.callingCode
            ] }, y.code))
          }
        )
      ] }),
      /* @__PURE__ */ e(
        "input",
        {
          ...m,
          ref: b,
          id: h,
          type: "tel",
          inputMode: "tel",
          value: o === "BR" && typeof u == "string" ? Wn(u) : u,
          maxLength: o === "BR" ? 15 : m.maxLength,
          onChange: (y) => {
            o === "BR" && (y.currentTarget.value = Wn(y.currentTarget.value)), d == null || d(y);
          },
          className: Ue.input,
          disabled: l,
          "aria-describedby": v,
          "aria-invalid": a ? !0 : void 0
        }
      )
    ] }),
    (a || s) && /* @__PURE__ */ e("p", { id: v, className: g(Ue.help, a && Ue.helpError), children: a || s })
  ] });
}), P_ = "_field_1tire_1", F_ = "_block_1tire_6", H_ = "_label_1tire_8", Q_ = "_shell_1tire_17", U_ = "_hasError_1tire_33", V_ = "_disabled_1tire_39", G_ = "_input_1tire_45", K_ = "_affix_1tire_57", X_ = "_help_1tire_77", Z_ = "_helpError_1tire_83", Ve = {
  field: P_,
  block: F_,
  label: H_,
  shell: Q_,
  hasError: U_,
  disabled: V_,
  input: G_,
  affix: K_,
  help: X_,
  helpError: Z_
}, Y_ = te(function({
  label: t,
  hint: s,
  error: a,
  prefix: o,
  suffix: c,
  block: i = !0,
  className: _,
  id: f,
  disabled: l,
  "aria-describedby": d,
  "aria-invalid": u,
  ...m
}, b) {
  const p = f || (t ? `in-${t.replace(/\s+/g, "-").toLowerCase()}` : void 0), h = p && (a || s) ? `${p}-help` : void 0;
  return /* @__PURE__ */ r("div", { className: g(Ve.field, i && Ve.block, _), children: [
    t && /* @__PURE__ */ e("label", { className: Ve.label, htmlFor: p, children: t }),
    /* @__PURE__ */ r(
      "div",
      {
        className: g(Ve.shell, a && Ve.hasError, l && Ve.disabled),
        children: [
          o && /* @__PURE__ */ e("span", { className: Ve.affix, children: o }),
          /* @__PURE__ */ e(
            "input",
            {
              ref: b,
              id: p,
              className: Ve.input,
              disabled: l,
              "aria-describedby": d ?? h,
              "aria-invalid": a ? !0 : u,
              ...m
            }
          ),
          c && /* @__PURE__ */ e("span", { className: Ve.affix, children: c })
        ]
      }
    ),
    (a || s) && /* @__PURE__ */ e("p", { id: h, className: g(Ve.help, a && Ve.helpError), children: a || s })
  ] });
}), J_ = "_root_ryh5o_1", e1 = "_row_ryh5o_7", t1 = "_button_ryh5o_14", n1 = "_status_ryh5o_19", a1 = "_error_ryh5o_26", Yt = {
  root: J_,
  row: e1,
  button: t1,
  status: n1,
  error: a1
};
function Ov({
  value: n,
  onChange: t,
  lookup: s,
  onAddressFound: a,
  name: o = "postalCode",
  error: c,
  disabled: i,
  className: _,
  onBlur: f
}) {
  const [l, d] = S("idle"), [u, m] = S(""), b = Y(null), p = Y(null);
  async function h(v = n) {
    const k = v.replace(/\D/g, "");
    if (k.length !== 8) {
      d("error"), m("Informe um CEP com 8 números.");
      return;
    }
    if (!(b.current === k || p.current === k)) {
      b.current = k, d("loading"), m("Buscando endereço.");
      try {
        const y = await s(k);
        if (!y) {
          d("error"), m("CEP não encontrado. Confira os números e tente novamente.");
          return;
        }
        a(y), p.current = k, d("success"), m(`Endereço encontrado em ${y.city}, ${y.state}.`);
      } catch {
        d("error"), m("Não foi possível buscar o CEP. Tente novamente.");
      } finally {
        b.current = null;
      }
    }
  }
  return /* @__PURE__ */ r("div", { className: g(Yt.root, _), children: [
    /* @__PURE__ */ r("div", { className: Yt.row, children: [
      /* @__PURE__ */ e(
        Y_,
        {
          label: "CEP",
          name: o,
          value: n,
          onChange: (v) => {
            v.currentTarget.value = v.currentTarget.value.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2"), p.current = null, d("idle"), m(""), t(v);
          },
          onBlur: (v) => {
            f == null || f(v), v.currentTarget.value.replace(/\D/g, "").length === 8 && h(v.currentTarget.value);
          },
          placeholder: "00000-000",
          inputMode: "numeric",
          autoComplete: "postal-code",
          maxLength: 9,
          error: c,
          disabled: i || l === "loading"
        }
      ),
      /* @__PURE__ */ e(
        oe,
        {
          type: "button",
          size: "sm",
          className: Yt.button,
          loading: l === "loading",
          loadingLabel: "Buscando",
          disabled: i,
          onClick: () => void h(),
          children: "Buscar CEP"
        }
      )
    ] }),
    u && !c && /* @__PURE__ */ e("p", { className: g(Yt.status, l === "error" && Yt.error), role: "status", "aria-live": "polite", children: u })
  ] });
}
const s1 = "_board_h1p36_1", r1 = "_column_h1p36_2", o1 = "_columnHeader_h1p36_3", c1 = "_items_h1p36_6", l1 = "_card_h1p36_7", i1 = "_cardHead_h1p36_8", d1 = "_leading_h1p36_10", _1 = "_description_h1p36_12", u1 = "_meta_h1p36_13", lt = {
  board: s1,
  column: r1,
  columnHeader: o1,
  items: c1,
  card: l1,
  cardHead: i1,
  leading: d1,
  description: _1,
  meta: u1
};
function Wv({ columns: n, ariaLabel: t = "Quadro Kanban", className: s }) {
  return /* @__PURE__ */ e("div", { className: g(lt.board, s), "aria-label": t, children: n.map((a) => /* @__PURE__ */ r("section", { className: lt.column, "aria-labelledby": `kanban-${a.id}`, children: [
    /* @__PURE__ */ r("header", { className: lt.columnHeader, children: [
      /* @__PURE__ */ r("div", { children: [
        /* @__PURE__ */ e("h2", { id: `kanban-${a.id}`, children: a.title }),
        a.description && /* @__PURE__ */ e("p", { children: a.description })
      ] }),
      /* @__PURE__ */ e(Xe, { tone: "neutral", children: a.items.length })
    ] }),
    /* @__PURE__ */ e("div", { className: lt.items, children: a.items.map((o) => /* @__PURE__ */ r("article", { className: lt.card, children: [
      /* @__PURE__ */ r("div", { className: lt.cardHead, children: [
        o.leading && /* @__PURE__ */ e("span", { className: lt.leading, children: o.leading }),
        /* @__PURE__ */ e("h3", { children: o.title })
      ] }),
      o.description && /* @__PURE__ */ e("div", { className: lt.description, children: o.description }),
      o.meta && /* @__PURE__ */ e("div", { className: lt.meta, children: o.meta }),
      o.footer && /* @__PURE__ */ e("footer", { children: o.footer })
    ] }, o.id)) })
  ] }, a.id)) });
}
const m1 = "_wrap_1edr1_1", h1 = "_menu_1edr1_6", p1 = "_menuEnd_1edr1_20", f1 = "_menuTop_1edr1_24", b1 = "_label_1edr1_40", g1 = "_sep_1edr1_49", v1 = "_item_1edr1_55", y1 = "_active_1edr1_66", k1 = "_itemDisabled_1edr1_69", N1 = "_danger_1edr1_72", $1 = "_icon_1edr1_80", w1 = "_itemLabel_1edr1_91", x1 = "_kbd_1edr1_96", C1 = "_meta_1edr1_100", Ce = {
  wrap: m1,
  menu: h1,
  menuEnd: p1,
  menuTop: f1,
  label: b1,
  sep: g1,
  item: v1,
  active: y1,
  itemDisabled: k1,
  danger: N1,
  icon: $1,
  itemLabel: w1,
  kbd: x1,
  meta: C1
};
function an({
  open: n,
  onOpenChange: t,
  entries: s,
  onSelect: a,
  children: o,
  align: c = "start",
  side: i = "bottom",
  className: _
}) {
  const f = Y(null), [l, d] = S(0), u = fe(
    () => s.filter((h) => !h.type || h.type === "item"),
    [s]
  );
  J(() => {
    n && d(0);
  }, [n]), J(() => {
    if (!n) return;
    function h(v) {
      var k;
      (k = f.current) != null && k.contains(v.target) || t(!1);
    }
    return document.addEventListener("pointerdown", h), () => document.removeEventListener("pointerdown", h);
  }, [n, t]);
  function m(h) {
    var v;
    h.disabled || ((v = h.onSelect) == null || v.call(h), a == null || a(h.id), t(!1));
  }
  function b(h) {
    if (n)
      switch (h.key) {
        case "ArrowDown":
          h.preventDefault(), d((v) => Math.min(v + 1, u.length - 1));
          break;
        case "ArrowUp":
          h.preventDefault(), d((v) => Math.max(v - 1, 0));
          break;
        case "Enter":
        case " ":
          u[l] && (h.preventDefault(), m(u[l]));
          break;
        case "Escape":
          h.preventDefault(), t(!1);
          break;
      }
  }
  let p = -1;
  return /* @__PURE__ */ r("div", { ref: f, className: g(Ce.wrap, _), onKeyDown: b, children: [
    o,
    n && /* @__PURE__ */ e(
      "div",
      {
        role: "menu",
        "aria-activedescendant": u[l] ? `menu-item-${u[l].id}` : void 0,
        className: g(Ce.menu, c === "end" && Ce.menuEnd, i === "top" && Ce.menuTop),
        children: s.map((h, v) => {
          if (h.type === "separator") return /* @__PURE__ */ e("div", { className: Ce.sep, role: "separator" }, `sep-${v}`);
          if (h.type === "label")
            return /* @__PURE__ */ e("div", { className: Ce.label, children: h.label }, `label-${v}`);
          p += 1;
          const k = p, y = k === l;
          return /* @__PURE__ */ r(
            "div",
            {
              id: `menu-item-${h.id}`,
              role: "menuitem",
              "aria-disabled": h.disabled || void 0,
              className: g(
                Ce.item,
                y && Ce.active,
                h.danger && Ce.danger,
                h.disabled && Ce.itemDisabled
              ),
              onMouseEnter: () => d(k),
              onClick: () => m(h),
              children: [
                h.icon && /* @__PURE__ */ e("span", { className: Ce.icon, children: h.icon }),
                /* @__PURE__ */ e("span", { className: Ce.itemLabel, children: h.label }),
                h.meta && /* @__PURE__ */ e("span", { className: Ce.meta, children: h.meta }),
                h.shortcut && /* @__PURE__ */ e(nn, { className: Ce.kbd, children: h.shortcut })
              ]
            },
            h.id
          );
        })
      }
    )
  ] });
}
const L1 = "_menuHost_1ya2m_1", z1 = "_split_1ya2m_9", M1 = "_main_1ya2m_15", D1 = "_caret_1ya2m_20", I1 = "_caretIcon_1ya2m_28", j1 = "_isOpen_1ya2m_36", Tt = {
  menuHost: L1,
  split: z1,
  main: M1,
  caret: D1,
  caretIcon: I1,
  isOpen: j1
}, E1 = /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) });
function Pv({
  label: n,
  variant: t = "secondary",
  menuAlign: s = "end",
  leadingIcon: a,
  onClick: o,
  onSelect: c,
  options: i,
  size: _ = "md",
  disabled: f = !1,
  loading: l = !1,
  loadingLabel: d = "Processando…",
  open: u,
  defaultOpen: m = !1,
  onOpenChange: b,
  defaultOptionId: p,
  className: h
}) {
  const [v, k] = S(m), y = (B, L) => B.id ?? `${L}-${B.label}`, w = i.findIndex((B) => !B.disabled), $ = w >= 0 ? y(i[w], w) : void 0, [C, N] = S(p ?? $), x = u !== void 0, j = x ? u : v;
  function E(B) {
    x || k(B), b == null || b(B);
  }
  const O = i.find((B, L) => y(B, L) === C || B.label === C), T = i.map((B, L) => ({
    id: y(B, L),
    label: B.label,
    meta: B.hint,
    disabled: B.disabled,
    danger: B.danger,
    onSelect: B.onSelect
  }));
  return /* @__PURE__ */ e(
    an,
    {
      open: j,
      onOpenChange: E,
      onSelect: (B) => {
        N(B), c == null || c(B);
      },
      entries: T,
      align: s,
      className: g(Tt.menuHost, h),
      children: /* @__PURE__ */ r("div", { className: g(Tt.split, j && Tt.isOpen), children: [
        /* @__PURE__ */ e(
          oe,
          {
            variant: t,
            size: _,
            leadingIcon: a,
            loading: l,
            loadingLabel: d,
            disabled: f,
            className: Tt.main,
            onClick: () => {
              var B;
              O && ((B = O.onSelect) == null || B.call(O)), o == null || o();
            },
            children: O ? `${n} ${O.label}` : n
          }
        ),
        /* @__PURE__ */ e(
          oe,
          {
            variant: t,
            size: _,
            disabled: f || l,
            className: Tt.caret,
            "aria-label": "Mais opções",
            "aria-haspopup": "menu",
            "aria-expanded": j,
            onClick: () => E(!j),
            children: /* @__PURE__ */ e("span", { className: Tt.caretIcon, children: E1 })
          }
        )
      ] })
    }
  );
}
const B1 = "_wrap_7khnr_1", A1 = "_sideTop_7khnr_6", S1 = "_fullWidthMenu_7khnr_12", R1 = "_trigger_7khnr_17", T1 = "_triggerCompact_7khnr_38", q1 = "_meta_7khnr_44", O1 = "_name_7khnr_50", W1 = "_email_7khnr_59", P1 = "_caret_7khnr_68", it = {
  wrap: B1,
  sideTop: A1,
  fullWidthMenu: S1,
  trigger: R1,
  triggerCompact: T1,
  meta: q1,
  name: O1,
  email: W1,
  caret: P1
}, F1 = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ e("circle", { cx: "12", cy: "7", r: "4" }),
  /* @__PURE__ */ e("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" })
] }), H1 = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
  /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "3" }),
  /* @__PURE__ */ e("path", { d: "M12 1v4m0 14v4M4.2 4.2l2.8 2.8m10 10 2.8 2.8M1 12h4m14 0h4M4.2 19.8 7 17m10-10 2.8-2.8" })
] }), Q1 = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ e("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
  /* @__PURE__ */ e("polyline", { points: "16 17 21 12 16 7" }),
  /* @__PURE__ */ e("line", { x1: "21", y1: "12", x2: "9", y2: "12" })
] }), U1 = [
  { id: "profile", label: "Perfil", icon: F1 },
  { id: "settings", label: "Configurações", icon: H1 },
  { type: "separator" },
  { id: "logout", label: "Sair", icon: Q1, danger: !0 }
];
function V1({
  user: n,
  entries: t = U1,
  onSelect: s,
  compact: a,
  side: o = "bottom",
  align: c,
  className: i
}) {
  const [_, f] = S(!1);
  return /* @__PURE__ */ e(
    an,
    {
      open: _,
      onOpenChange: f,
      entries: t,
      onSelect: s,
      align: c ?? (a ? "end" : "start"),
      className: g(
        it.wrap,
        o === "top" && it.sideTop,
        !a && it.fullWidthMenu,
        i
      ),
      children: /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: g(it.trigger, a && it.triggerCompact),
          "aria-haspopup": "menu",
          "aria-expanded": _,
          "aria-label": `Conta de ${n.name}`,
          onClick: () => f((l) => !l),
          children: [
            /* @__PURE__ */ e(Ze, { size: "md", initials: n.initials, src: n.src, seed: n.seed }),
            !a && /* @__PURE__ */ r("span", { className: it.meta, children: [
              /* @__PURE__ */ e("span", { className: it.name, children: n.name }),
              n.email && /* @__PURE__ */ e("span", { className: it.email, children: n.email })
            ] }),
            !a && /* @__PURE__ */ e("svg", { className: it.caret, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) })
          ]
        }
      )
    }
  );
}
const G1 = "_wrap_5qds1_1", K1 = "_trigger_5qds1_7", X1 = "_triggerCompact_5qds1_30", Z1 = "_meta_5qds1_35", Y1 = "_name_5qds1_41", J1 = "_role_5qds1_49", eu = "_caret_5qds1_57", tu = "_pop_5qds1_64", nu = "_searchRow_5qds1_89", au = "_searchInput_5qds1_102", su = "_list_5qds1_116", ru = "_option_5qds1_122", ou = "_active_5qds1_131", cu = "_optionMeta_5qds1_135", lu = "_optionName_5qds1_141", iu = "_optionRole_5qds1_149", du = "_check_5qds1_157", _u = "_empty_5qds1_164", _e = {
  wrap: G1,
  trigger: K1,
  triggerCompact: X1,
  meta: Z1,
  name: Y1,
  role: J1,
  caret: eu,
  pop: tu,
  searchRow: nu,
  searchInput: au,
  list: su,
  option: ru,
  active: ou,
  optionMeta: cu,
  optionName: lu,
  optionRole: iu,
  check: du,
  empty: _u
};
function uu({
  workspaces: n,
  value: t,
  defaultValue: s,
  onChange: a,
  compact: o,
  className: c
}) {
  var C;
  const [i, _] = S(s ?? ((C = n[0]) == null ? void 0 : C.id)), f = t !== void 0 ? t : i, l = n.find((N) => N.id === f) ?? n[0], [d, u] = S(!1), [m, b] = S(""), [p, h] = S(0), v = Y(null), k = n.length >= 5, y = fe(() => {
    const N = m.trim().toLowerCase();
    return N ? n.filter((x) => x.name.toLowerCase().includes(N)) : n;
  }, [n, m]);
  J(() => {
    d && (b(""), h(Math.max(0, n.findIndex((N) => N.id === f))));
  }, [d, n, f]), J(() => {
    if (!d) return;
    function N(x) {
      var j;
      (j = v.current) != null && j.contains(x.target) || u(!1);
    }
    return document.addEventListener("pointerdown", N), () => document.removeEventListener("pointerdown", N);
  }, [d]);
  function w(N) {
    t === void 0 && _(N.id), a == null || a(N), u(!1);
  }
  function $(N) {
    if (d)
      switch (N.key) {
        case "ArrowDown":
          N.preventDefault(), h((x) => Math.min(x + 1, y.length - 1));
          break;
        case "ArrowUp":
          N.preventDefault(), h((x) => Math.max(x - 1, 0));
          break;
        case "Enter":
          y[p] && (N.preventDefault(), w(y[p]));
          break;
        case "Escape":
          N.preventDefault(), u(!1);
          break;
      }
  }
  return l ? /* @__PURE__ */ r("div", { ref: v, className: g(_e.wrap, c), onKeyDown: $, children: [
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: g(_e.trigger, o && _e.triggerCompact),
        "aria-haspopup": "listbox",
        "aria-expanded": d,
        "aria-label": `Ambiente atual: ${l.name}. Trocar ambiente`,
        onClick: () => u((N) => !N),
        children: [
          /* @__PURE__ */ e(Ze, { size: "md", initials: l.initials, style: { borderRadius: 6 } }),
          !o && /* @__PURE__ */ r("span", { className: _e.meta, children: [
            /* @__PURE__ */ e("span", { className: _e.name, children: l.name }),
            l.role && /* @__PURE__ */ e("span", { className: _e.role, children: l.role })
          ] }),
          !o && /* @__PURE__ */ e("svg", { className: _e.caret, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "m7 15 5 5 5-5M7 9l5-5 5 5" }) })
        ]
      }
    ),
    d && /* @__PURE__ */ r("div", { className: _e.pop, children: [
      k && /* @__PURE__ */ r("div", { className: _e.searchRow, children: [
        /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
          /* @__PURE__ */ e("circle", { cx: "11", cy: "11", r: "7" }),
          /* @__PURE__ */ e("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
        ] }),
        /* @__PURE__ */ e(
          "input",
          {
            autoFocus: !0,
            className: _e.searchInput,
            placeholder: "Buscar ambiente…",
            value: m,
            onChange: (N) => {
              b(N.target.value), h(0);
            }
          }
        )
      ] }),
      /* @__PURE__ */ e("div", { role: "listbox", "aria-label": "Ambientes", className: _e.list, children: y.length === 0 ? /* @__PURE__ */ e("div", { className: _e.empty, children: "Nenhum ambiente" }) : y.map((N, x) => {
        const j = N.id === f;
        return /* @__PURE__ */ r(
          "div",
          {
            role: "option",
            "aria-selected": j,
            className: g(_e.option, x === p && _e.active),
            onMouseEnter: () => h(x),
            onMouseDown: (E) => E.preventDefault(),
            onClick: () => w(N),
            children: [
              /* @__PURE__ */ e(Ze, { size: "sm", initials: N.initials, style: { borderRadius: 5 } }),
              /* @__PURE__ */ r("span", { className: _e.optionMeta, children: [
                /* @__PURE__ */ e("span", { className: _e.optionName, children: N.name }),
                N.role && /* @__PURE__ */ e("span", { className: _e.optionRole, children: N.role })
              ] }),
              j && /* @__PURE__ */ e("svg", { className: _e.check, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" }) })
            ]
          },
          N.id
        );
      }) })
    ] })
  ] }) : null;
}
const mu = "_sidebar_hj9or_1", hu = "_collapsed_hj9or_14", pu = "_rail_hj9or_17", fu = "_compact_hj9or_18", bu = "_top_hj9or_20", gu = "_logo_hj9or_28", vu = "_collapseBtn_hj9or_34", yu = "_wsWrap_hj9or_68", ku = "_ws_hj9or_68", Nu = "_wsMeta_hj9or_88", $u = "_wsName_hj9or_94", wu = "_wsRole_hj9or_102", xu = "_ctaWrap_hj9or_114", Cu = "_cta_hj9or_114", Lu = "_nav_hj9or_145", zu = "_section_hj9or_154", Mu = "_item_hj9or_171", Du = "_itemActive_hj9or_197", Iu = "_itemIcon_hj9or_213", ju = "_itemLabel_hj9or_222", Eu = "_badge_hj9or_229", Bu = "_footer_hj9or_282", Au = "_accountMeta_hj9or_290", Su = "_accountName_hj9or_296", Ru = "_accountEmail_hj9or_304", Tu = "_expandTrigger_hj9or_317", re = {
  sidebar: mu,
  collapsed: hu,
  rail: pu,
  compact: fu,
  top: bu,
  logo: gu,
  collapseBtn: vu,
  wsWrap: yu,
  ws: ku,
  wsMeta: Nu,
  wsName: $u,
  wsRole: wu,
  ctaWrap: xu,
  cta: Cu,
  nav: Lu,
  section: zu,
  item: Mu,
  itemActive: Du,
  itemIcon: Iu,
  itemLabel: ju,
  badge: Eu,
  footer: Bu,
  accountMeta: Au,
  accountName: Su,
  accountEmail: Ru,
  expandTrigger: Tu
};
function qu({
  groups: n,
  activeId: t,
  defaultActiveId: s,
  workspace: a,
  workspaces: o,
  workspaceId: c,
  onWorkspaceChange: i,
  account: _,
  accountMenu: f,
  onAccountSelect: l,
  cta: d,
  brand: u = "refy",
  defaultCollapsed: m = !1,
  mode: b,
  defaultMode: p,
  onModeChange: h,
  onNavigate: v
}) {
  var O;
  const [k, y] = S(p ?? (m ? "compact" : "expanded")), [w, $] = S(s), C = t !== void 0 ? t : w, N = b ?? k, x = N !== "expanded", j = N !== "compact";
  function E(T) {
    b === void 0 && y(T), h == null || h(T);
  }
  return /* @__PURE__ */ r("aside", { className: g(re.sidebar, re[N], x && re.collapsed), "data-mode": N, children: [
    /* @__PURE__ */ r("div", { className: re.top, children: [
      /* @__PURE__ */ e("span", { className: re.logo, children: typeof u == "string" && (u === "refy" || u === "dommus") ? /* @__PURE__ */ e(Kn, { brand: u, size: x ? "xs" : "sm", markOnly: x }) : !x && u }),
      /* @__PURE__ */ e(
        ge,
        {
          className: re.collapseBtn,
          "aria-label": x ? "Expandir menu" : "Recolher menu",
          onClick: () => E(x ? "expanded" : "compact"),
          icon: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "15 18 9 12 15 6" }) })
        }
      )
    ] }),
    o ? /* @__PURE__ */ e("div", { className: re.wsWrap, children: x ? (
      /* colapsada: clicar expande a sidebar primeiro; o menu só abre expandida */
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: re.expandTrigger,
          "aria-label": "Expandir menu para trocar de ambiente",
          onClick: () => E("expanded"),
          children: /* @__PURE__ */ e(
            Ze,
            {
              size: "md",
              initials: ((O = o.find((T) => T.id === c)) == null ? void 0 : O.initials) ?? o[0].initials,
              style: { borderRadius: 6 }
            }
          )
        }
      )
    ) : /* @__PURE__ */ e(
      uu,
      {
        workspaces: o,
        value: c,
        onChange: i
      }
    ) }) : a && /* @__PURE__ */ r("button", { type: "button", className: re.ws, "aria-label": "Trocar ambiente", children: [
      /* @__PURE__ */ e(Ze, { size: "md", initials: a.initials, style: { borderRadius: 6 } }),
      !x && /* @__PURE__ */ r("span", { className: re.wsMeta, children: [
        /* @__PURE__ */ e("span", { className: re.wsName, children: a.name }),
        a.role && /* @__PURE__ */ e("span", { className: re.wsRole, children: a.role })
      ] })
    ] }),
    d && /* @__PURE__ */ e("div", { className: re.ctaWrap, children: /* @__PURE__ */ e(
      oe,
      {
        variant: "primary",
        block: !0,
        className: re.cta,
        leadingIcon: d.icon,
        "aria-label": x ? d.label : void 0,
        "data-tip": d.label,
        onClick: d.onClick,
        children: !x && d.label
      }
    ) }),
    /* @__PURE__ */ e("nav", { className: re.nav, children: n.map((T, B) => /* @__PURE__ */ r("div", { children: [
      T.section && /* @__PURE__ */ e("div", { className: re.section, children: T.section }),
      T.items.map((L) => {
        const I = L.id === C, z = L.href ? "a" : "button", M = /* @__PURE__ */ r(
          z,
          {
            href: L.href,
            target: L.target,
            className: g(re.item, I && re.itemActive),
            "data-tip": L.label,
            "aria-label": N === "compact" ? L.label : void 0,
            "aria-current": I ? "page" : void 0,
            onClick: () => {
              t === void 0 && $(L.id), v == null || v(L);
            },
            children: [
              /* @__PURE__ */ e("span", { className: re.itemIcon, children: L.icon }),
              j && /* @__PURE__ */ e("span", { className: re.itemLabel, children: L.label }),
              L.badge != null && /* @__PURE__ */ e(Xe, { tone: "danger", className: re.badge, children: L.badge })
            ]
          },
          L.id
        );
        return x ? /* @__PURE__ */ e(vn, { label: L.label, side: "right", delayMs: 250, portalled: !0, children: M }, L.id) : M;
      })
    ] }, T.section ?? B)) }),
    _ && /* @__PURE__ */ e("div", { className: re.footer, children: x ? (
      /* colapsada: clicar expande a sidebar primeiro; o menu só abre expandida */
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: re.expandTrigger,
          "aria-label": `Expandir menu para abrir a conta de ${_.name}`,
          onClick: () => E("expanded"),
          children: /* @__PURE__ */ e(Ze, { size: "md", initials: _.initials, seed: _.seed })
        }
      )
    ) : /* @__PURE__ */ e(
      V1,
      {
        user: _,
        entries: f,
        onSelect: l,
        side: "top"
      }
    ) })
  ] });
}
const Ou = "_breadcrumb_1fdu9_1", Wu = "_list_1fdu9_9", Pu = "_item_1fdu9_21", Fu = "_link_1fdu9_29", Hu = "_current_1fdu9_59", Qu = "_sep_1fdu9_70", Uu = "_root_1fdu9_75", Vu = "_collapsed_1fdu9_76", Te = {
  breadcrumb: Ou,
  list: Wu,
  item: Pu,
  link: Fu,
  current: Hu,
  sep: Qu,
  root: Uu,
  collapsed: Vu
};
function Gu({ items: n, root: t, separator: s = "/", collapseAfter: a = 5, className: o }) {
  const [c, i] = S(!1), _ = be().replace(/:/g, ""), f = n.length >= a, l = f ? n.slice(1, -2) : [], d = f ? [n[0], ...n.slice(-2)] : n;
  function u(p) {
    p.onClick ? p.onClick() : p.href && typeof window < "u" && window.location.assign(p.href);
  }
  function m(p, h = !1, v) {
    const k = typeof p.label == "string" ? p.label : void 0;
    return h ? /* @__PURE__ */ e("b", { className: g(Te.current, v), "aria-current": "page", title: k, children: p.label }) : p.href ? /* @__PURE__ */ e("a", { className: g(Te.link, v), href: p.href, onClick: p.onClick, title: k, children: p.label }) : /* @__PURE__ */ e("button", { type: "button", className: g(Te.link, v), onClick: p.onClick, title: k, children: p.label });
  }
  const b = /* @__PURE__ */ r("svg", { "aria-hidden": "true", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ e("path", { d: "M3 11 12 3l9 8" }),
    /* @__PURE__ */ e("path", { d: "M5 10v10h14V10" })
  ] });
  return /* @__PURE__ */ e("nav", { "aria-label": "Trilha de navegação", className: g(Te.breadcrumb, o), children: /* @__PURE__ */ r("ol", { className: Te.list, children: [
    t && /* @__PURE__ */ r("li", { className: Te.item, children: [
      t.href ? /* @__PURE__ */ e("a", { className: Te.root, href: t.href, onClick: t.onClick, "aria-label": typeof t.label == "string" ? t.label : "Início", children: b }) : /* @__PURE__ */ e("button", { type: "button", className: Te.root, onClick: t.onClick, "aria-label": typeof t.label == "string" ? t.label : "Início", children: b }),
      /* @__PURE__ */ e("span", { className: Te.sep, "aria-hidden": "true", children: s })
    ] }),
    d.map((p, h) => {
      const v = h === d.length - 1;
      return /* @__PURE__ */ r("li", { className: Te.item, children: [
        m(p, v),
        !v && /* @__PURE__ */ e("span", { className: Te.sep, "aria-hidden": "true", children: s }),
        f && h === 0 && /* @__PURE__ */ r(He, { children: [
          /* @__PURE__ */ e(
            an,
            {
              open: c,
              onOpenChange: i,
              entries: l.map((k, y) => ({ id: `${_}-${y}`, label: k.label, onSelect: () => u(k) })),
              children: /* @__PURE__ */ r("button", { type: "button", className: Te.collapsed, "aria-label": "Mostrar caminho oculto", "aria-expanded": c, "aria-haspopup": "menu", onClick: () => i((k) => !k), children: [
                /* @__PURE__ */ e("i", {}),
                /* @__PURE__ */ e("i", {}),
                /* @__PURE__ */ e("i", {})
              ] })
            }
          ),
          /* @__PURE__ */ e("span", { className: Te.sep, "aria-hidden": "true", children: s })
        ] })
      ] }, h);
    })
  ] }) });
}
const Ku = "_wrap_2d9e3_1", Xu = "_list_2d9e3_6", Zu = "_tab_2d9e3_15", Yu = "_badge_2d9e3_43", Ju = "_status_2d9e3_52", em = "_complete_2d9e3_63", tm = "_warning_2d9e3_67", nm = "_underline_2d9e3_73", am = "_active_2d9e3_91", sm = "_pill_2d9e3_99", rm = "_panel_2d9e3_125", om = "_wrapVertical_2d9e3_130", cm = "_listVertical_2d9e3_135", Pe = {
  wrap: Ku,
  list: Xu,
  tab: Zu,
  badge: Yu,
  status: Ju,
  complete: em,
  warning: tm,
  underline: nm,
  active: am,
  pill: sm,
  panel: rm,
  wrapVertical: om,
  listVertical: cm
}, lm = /* @__PURE__ */ e("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "m3 8 3 3 7-7" }) }), im = /* @__PURE__ */ r("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ e("path", { d: "M8 2 14 13H2L8 2Z" }),
  /* @__PURE__ */ e("path", { d: "M8 6v3M8 11.5h.01" })
] });
function dm({
  items: n,
  value: t,
  defaultValue: s,
  onChange: a,
  variant: o = "underline",
  orientation: c = "horizontal",
  className: i
}) {
  var h;
  const [_, f] = S(s ?? ((h = n[0]) == null ? void 0 : h.id)), l = t ?? _, d = be(), u = Y({});
  function m(v) {
    var k;
    (k = n.find((y) => y.id === v)) != null && k.disabled || (t === void 0 && f(v), a == null || a(v));
  }
  function b(v, k) {
    var j;
    const y = c === "vertical" ? "ArrowUp" : "ArrowLeft", w = c === "vertical" ? "ArrowDown" : "ArrowRight";
    if (![y, w, "Home", "End"].includes(v.key)) return;
    v.preventDefault();
    const $ = n.filter((E) => !E.disabled), C = $.findIndex((E) => E.id === k);
    let N = C;
    v.key === "Home" ? N = 0 : v.key === "End" ? N = $.length - 1 : v.key === y ? N = (C - 1 + $.length) % $.length : v.key === w && (N = (C + 1) % $.length);
    const x = $[N];
    x && (m(x.id), (j = u.current[x.id]) == null || j.focus());
  }
  const p = n.find((v) => v.id === l);
  return /* @__PURE__ */ r("div", { className: g(Pe.wrap, c === "vertical" && Pe.wrapVertical, i), children: [
    /* @__PURE__ */ e(
      "div",
      {
        className: g(
          Pe.list,
          c === "vertical" ? Pe.listVertical : o === "pill" ? Pe.pill : Pe.underline
        ),
        role: "tablist",
        "aria-orientation": c,
        children: n.map((v) => {
          const k = v.id === l;
          return /* @__PURE__ */ r(
            "button",
            {
              role: "tab",
              type: "button",
              ref: (y) => {
                u.current[v.id] = y;
              },
              id: `${d}-tab-${v.id}`,
              "aria-selected": k,
              "aria-controls": `${d}-panel-${v.id}`,
              "aria-disabled": v.disabled || void 0,
              disabled: v.disabled,
              tabIndex: k ? 0 : -1,
              className: g(Pe.tab, k && Pe.active),
              onClick: () => m(v.id),
              onKeyDown: (y) => b(y, v.id),
              children: [
                v.label,
                v.badge != null && /* @__PURE__ */ e("span", { className: Pe.badge, children: v.badge }),
                v.status != null && /* @__PURE__ */ e(
                  "span",
                  {
                    className: g(Pe.status, Pe[v.status]),
                    "aria-label": v.status === "complete" ? "Status: concluída" : "Status: requer atenção",
                    title: v.status === "complete" ? "Concluída" : "Requer atenção",
                    children: v.status === "complete" ? lm : im
                  }
                )
              ]
            },
            v.id
          );
        })
      }
    ),
    (p == null ? void 0 : p.content) != null && /* @__PURE__ */ e(
      "div",
      {
        role: "tabpanel",
        id: `${d}-panel-${p.id}`,
        "aria-labelledby": `${d}-tab-${p.id}`,
        className: Pe.panel,
        children: p.content
      }
    )
  ] });
}
const _m = "_topbar_1yhfl_1", um = "_dense_1yhfl_18", mm = "_brand_1yhfl_19", hm = "_divider_1yhfl_20", pm = "_crumb_1yhfl_21", fm = "_spacer_1yhfl_22", bm = "_search_1yhfl_24", gm = "_searchText_1yhfl_45", vm = "_kbd_1yhfl_46", ym = "_tabs_1yhfl_48", km = "_segmented_1yhfl_50", Nm = "_actions_1yhfl_51", Fe = {
  topbar: _m,
  dense: um,
  brand: mm,
  divider: hm,
  crumb: pm,
  spacer: fm,
  search: bm,
  searchText: gm,
  kbd: vm,
  tabs: ym,
  segmented: km,
  actions: Nm
};
function $m({
  crumbs: n = [],
  brand: t = "refy",
  showBrand: s = !0,
  composition: a = "search",
  searchPlaceholder: o = "Buscar clientes, imóveis, visitas…",
  onSearchClick: c,
  tabs: i = [],
  tabValue: _,
  tabDefaultValue: f,
  onTabChange: l,
  segments: d = [],
  segmentValue: u,
  segmentDefaultValue: m,
  onSegmentChange: b,
  actions: p,
  className: h
}) {
  return /* @__PURE__ */ r("header", { className: g(Fe.topbar, a === "dense" && Fe.dense, h), children: [
    s && /* @__PURE__ */ e(Kn, { brand: t, size: a === "dense" ? "xs" : "sm", className: Fe.brand }),
    s && n.length > 0 && /* @__PURE__ */ e("span", { className: Fe.divider, "aria-hidden": "true" }),
    n.length > 0 && /* @__PURE__ */ e(
      Gu,
      {
        className: Fe.crumb,
        items: n.map((v) => ({ label: v.label, href: v.href, onClick: v.onClick }))
      }
    ),
    /* @__PURE__ */ e("span", { className: Fe.spacer }),
    a === "search" && /* @__PURE__ */ r("button", { type: "button", className: Fe.search, "aria-label": o, onClick: c, children: [
      /* @__PURE__ */ r("svg", { "aria-hidden": "true", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ e("circle", { cx: "11", cy: "11", r: "8" }),
        /* @__PURE__ */ e("path", { d: "m21 21-4.3-4.3" })
      ] }),
      /* @__PURE__ */ e("span", { className: Fe.searchText, children: o }),
      /* @__PURE__ */ e(nn, { className: Fe.kbd, children: "⌘K" })
    ] }),
    a === "tabs" && i.length > 0 && /* @__PURE__ */ e(
      dm,
      {
        items: i,
        variant: "pill",
        value: _,
        defaultValue: f,
        onChange: l,
        className: Fe.tabs
      }
    ),
    a === "dense" && d.length > 0 && /* @__PURE__ */ e(
      Yn,
      {
        options: d,
        value: u,
        defaultValue: m,
        onChange: b,
        label: "Modo de visualização",
        className: Fe.segmented
      }
    ),
    p && /* @__PURE__ */ e("div", { className: Fe.actions, children: p })
  ] });
}
const wm = "_shell_nw6f4_1", xm = "_main_nw6f4_17", Cm = "_body_nw6f4_23", Lm = "_content_nw6f4_28", _n = {
  shell: wm,
  main: xm,
  body: Cm,
  content: Lm
};
function Fv({
  sidebar: n,
  topbar: t,
  contentMaxWidth: s = 1240,
  theme: a,
  children: o,
  className: c
}) {
  return /* @__PURE__ */ r("div", { className: g(_n.shell, c), "data-theme": a, children: [
    /* @__PURE__ */ e(qu, { ...n }),
    /* @__PURE__ */ r("main", { className: _n.main, children: [
      /* @__PURE__ */ e($m, { ...t }),
      /* @__PURE__ */ e("div", { className: _n.body, children: /* @__PURE__ */ e("div", { className: _n.content, style: { maxWidth: s }, children: o }) })
    ] })
  ] });
}
const zm = "_field_rw125_1", Mm = "_block_rw125_2", Dm = "_label_rw125_4", Im = "_shell_rw125_13", jm = "_disabled_rw125_24", Em = "_hasError_rw125_26", Bm = "_select_rw125_29", Am = "_caret_rw125_43", Sm = "_help_rw125_52", Rm = "_helpError_rw125_53", Je = {
  field: zm,
  block: Mm,
  label: Dm,
  shell: Im,
  disabled: jm,
  hasError: Em,
  select: Bm,
  caret: Am,
  help: Sm,
  helpError: Rm
}, Tm = te(function({ label: t, hint: s, error: a, block: o = !0, className: c, id: i, disabled: _, children: f, ...l }, d) {
  const u = i || (t ? `sel-${t.replace(/\s+/g, "-").toLowerCase()}` : void 0);
  return /* @__PURE__ */ r("div", { className: g(Je.field, o && Je.block, c), children: [
    t && /* @__PURE__ */ e("label", { className: Je.label, htmlFor: u, children: t }),
    /* @__PURE__ */ r("div", { className: g(Je.shell, a && Je.hasError, _ && Je.disabled), children: [
      /* @__PURE__ */ e("select", { ref: d, id: u, className: Je.select, disabled: _, ...l, children: f }),
      /* @__PURE__ */ e("svg", { className: Je.caret, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "m6 9 6 6 6-6" }) })
    ] }),
    (a || s) && /* @__PURE__ */ e("p", { className: g(Je.help, a && Je.helpError), children: a || s })
  ] });
}), qm = "_row_d32p5_1", Om = "_disabled_d32p5_8", Wm = "_input_d32p5_10", Pm = "_box_d32p5_16", Fm = "_text_d32p5_71", Hm = "_label_d32p5_72", Qm = "_desc_d32p5_78", Um = "_tag_d32p5_84", Vm = "_meta_d32p5_89", Gm = "_boxed_d32p5_99", et = {
  row: qm,
  disabled: Om,
  input: Wm,
  box: Pm,
  text: Fm,
  label: Hm,
  desc: Qm,
  tag: Um,
  meta: Vm,
  boxed: Gm
}, Hv = te(function({ label: t, description: s, tag: a, meta: o, boxed: c = !1, className: i, id: _, disabled: f, ...l }, d) {
  const u = _ || l.name;
  return /* @__PURE__ */ r(
    "label",
    {
      className: g(et.row, c && et.boxed, f && et.disabled, i),
      htmlFor: u,
      children: [
        /* @__PURE__ */ e(
          "input",
          {
            ref: d,
            id: u,
            type: "checkbox",
            className: et.input,
            disabled: f,
            ...l
          }
        ),
        /* @__PURE__ */ e("span", { className: et.box, "aria-hidden": "true", children: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", focusable: "false", children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }) }) }),
        (t || s) && /* @__PURE__ */ r("span", { className: et.text, children: [
          t && /* @__PURE__ */ r("span", { className: et.label, children: [
            t,
            a != null && /* @__PURE__ */ e("span", { className: et.tag, children: a })
          ] }),
          s && /* @__PURE__ */ e("span", { className: et.desc, children: s })
        ] }),
        o != null && /* @__PURE__ */ e("span", { className: et.meta, children: o })
      ]
    }
  );
}), Km = "_group_1vteg_1", Xm = "_groupLabel_1vteg_6", Zm = "_opt_1vteg_15", Ym = "_input_1vteg_29", Jm = "_dot_1vteg_35", eh = "_body_1vteg_73", th = "_optLabel_1vteg_79", nh = "_optHint_1vteg_84", ah = "_disabled_1vteg_89", dt = {
  group: Km,
  groupLabel: Xm,
  opt: Zm,
  input: Ym,
  dot: Jm,
  body: eh,
  optLabel: th,
  optHint: nh,
  disabled: ah
}, Qv = te(function({ name: t, options: s, value: a, defaultValue: o, onChange: c, label: i, className: _, inputProps: f }, l) {
  return /* @__PURE__ */ r("div", { ref: l, className: g(dt.group, _), role: "radiogroup", "aria-label": i, children: [
    i && /* @__PURE__ */ e("span", { className: dt.groupLabel, children: i }),
    s.map((d) => {
      const u = a !== void 0 ? a === d.value : void 0, m = a === void 0 ? o === d.value : void 0;
      return /* @__PURE__ */ r("label", { className: g(dt.opt, d.disabled && dt.disabled), children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "radio",
            name: t,
            value: d.value,
            className: dt.input,
            checked: u,
            defaultChecked: m,
            disabled: d.disabled,
            onChange: (b) => c == null ? void 0 : c(b.target.value),
            ...f
          }
        ),
        /* @__PURE__ */ e("span", { className: dt.dot, "aria-hidden": "true" }),
        /* @__PURE__ */ r("span", { className: dt.body, children: [
          /* @__PURE__ */ e("span", { className: dt.optLabel, children: d.label }),
          d.hint && /* @__PURE__ */ e("span", { className: dt.optHint, children: d.hint })
        ] })
      ] }, d.value);
    })
  ] });
}), Pn = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function sa(n, t, s) {
  const a = Y(s);
  J(() => {
    a.current = s;
  }, [s]), J(() => {
    if (!n) return;
    const o = document.activeElement;
    function c(i) {
      var d, u;
      if (i.key === "Escape") {
        i.preventDefault(), a.current();
        return;
      }
      if (i.key !== "Tab") return;
      const _ = Array.from(
        ((d = t.current) == null ? void 0 : d.querySelectorAll(Pn)) ?? []
      );
      if (_.length === 0) {
        i.preventDefault(), (u = t.current) == null || u.focus();
        return;
      }
      const f = _[0], l = _[_.length - 1];
      i.shiftKey && document.activeElement === f ? (i.preventDefault(), l.focus()) : !i.shiftKey && document.activeElement === l && (i.preventDefault(), f.focus());
    }
    return document.addEventListener("keydown", c), requestAnimationFrame(() => {
      var _, f;
      (f = ((_ = t.current) == null ? void 0 : _.querySelector(Pn)) ?? t.current) == null || f.focus();
    }), () => {
      document.removeEventListener("keydown", c), o == null || o.focus();
    };
  }, [t, n]);
}
const sh = "_scrim_xc4ep_1", rh = "_modal_xc4ep_17", oh = "_header_xc4ep_32", ch = "_title_xc4ep_40", lh = "_body_xc4ep_48", ih = "_footer_xc4ep_55", qt = {
  scrim: sh,
  modal: rh,
  header: oh,
  title: ch,
  body: lh,
  footer: ih
}, dh = /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M18 6 6 18M6 6l12 12" }) });
function Uv({ open: n, onClose: t, title: s, ariaLabel: a = "Janela modal", footer: o, width: c = 520, children: i, className: _ }) {
  const f = Y(null), l = be();
  return sa(n, f, t), J(() => {
    if (!n) return;
    const d = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.body.style.overflow = d;
    };
  }, [n]), n ? /* @__PURE__ */ e("div", { className: qt.scrim, onClick: t, children: /* @__PURE__ */ r(
    "div",
    {
      ref: f,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": s ? l : void 0,
      "aria-label": s ? void 0 : a,
      tabIndex: -1,
      className: g(qt.modal, _),
      style: { maxWidth: c },
      onClick: (d) => d.stopPropagation(),
      children: [
        s && /* @__PURE__ */ r("header", { className: qt.header, children: [
          /* @__PURE__ */ e("h2", { id: l, className: qt.title, children: s }),
          /* @__PURE__ */ e(ge, { icon: dh, "aria-label": "Fechar", variant: "ghost", onClick: t })
        ] }),
        /* @__PURE__ */ e("div", { className: qt.body, children: i }),
        o && /* @__PURE__ */ e("footer", { className: qt.footer, children: o })
      ]
    }
  ) }) : null;
}
const _h = "_pagination_1ob44_1", uh = "_btn_1ob44_7", mh = "_active_1ob44_24", hh = "_ellipsis_1ob44_45", Ot = {
  pagination: _h,
  btn: uh,
  active: mh,
  ellipsis: hh
};
function ph(n, t, s) {
  const a = 2 * s + 5;
  if (t <= a) return Array.from({ length: t }, (_, f) => f + 1);
  const o = Math.max(2, n - s), c = Math.min(t - 1, n + s), i = [1];
  o > 2 && i.push("…");
  for (let _ = o; _ <= c; _++) i.push(_);
  return c < t - 1 && i.push("…"), i.push(t), i;
}
function fh({ page: n, pageCount: t, onPageChange: s, siblingCount: a = 1, className: o }) {
  const c = (i) => s(Math.max(1, Math.min(t, i)));
  return /* @__PURE__ */ r("nav", { "aria-label": "Paginação", className: g(Ot.pagination, o), children: [
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: Ot.btn,
        "aria-label": "Página anterior",
        disabled: n <= 1,
        onClick: () => c(n - 1),
        children: "‹"
      }
    ),
    ph(n, t, a).map(
      (i, _) => i === "…" ? /* @__PURE__ */ e("span", { className: Ot.ellipsis, "aria-hidden": "true", children: "…" }, `e-${_}`) : /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: g(Ot.btn, i === n && Ot.active),
          "aria-label": `Página ${i}`,
          "aria-current": i === n ? "page" : void 0,
          onClick: () => c(i),
          children: i
        },
        i
      )
    ),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: Ot.btn,
        "aria-label": "Próxima página",
        disabled: n >= t,
        onClick: () => c(n + 1),
        children: "›"
      }
    )
  ] });
}
const bh = "_wrap_vz2g2_1", gh = "_toolbar_vz2g2_6", vh = "_filters_vz2g2_7", yh = "_paginationBar_vz2g2_8", kh = "_scroller_vz2g2_9", Nh = "_table_vz2g2_13", $h = "_srOnly_vz2g2_18", wh = "_th_vz2g2_29", xh = "_td_vz2g2_42", Ch = "_right_vz2g2_51", Lh = "_num_vz2g2_54", zh = "_clickable_vz2g2_59", Mh = "_empty_vz2g2_71", Dh = "_error_vz2g2_77", Ih = "_paginationSummary_vz2g2_94", jh = "_paginationMeta_vz2g2_101", Eh = "_pageSizeControl_vz2g2_102", Bh = "_searchIcon_vz2g2_125", Ah = "_searchInput_vz2g2_136", Sh = "_searchCount_vz2g2_150", Rh = "_sortBtn_vz2g2_158", Th = "_sorted_vz2g2_174", qh = "_sortIcon_vz2g2_182", Oh = "_sortDesc_vz2g2_193", Wh = "_filtersLabel_vz2g2_214", Ph = "_facet_vz2g2_222", Fh = "_facetBtn_vz2g2_225", Hh = "_facetActive_vz2g2_254", Qh = "_facetCount_vz2g2_260", Uh = "_facetCaret_vz2g2_273", Vh = "_facetMenu_vz2g2_278", Gh = "_facetOpt_vz2g2_303", Kh = "_facetOptOn_vz2g2_321", Xh = "_facetCheck_vz2g2_324", Zh = "_facetValue_vz2g2_348", Yh = "_facetOptCount_vz2g2_355", Jh = "_facetClear_vz2g2_361", ep = "_clearAll_vz2g2_379", X = {
  wrap: bh,
  toolbar: gh,
  filters: vh,
  paginationBar: yh,
  scroller: kh,
  table: Nh,
  srOnly: $h,
  th: wh,
  td: xh,
  right: Ch,
  num: Lh,
  clickable: zh,
  empty: Mh,
  error: Dh,
  paginationSummary: Ih,
  paginationMeta: jh,
  pageSizeControl: Eh,
  searchIcon: Bh,
  searchInput: Ah,
  searchCount: Sh,
  sortBtn: Rh,
  sorted: Th,
  sortIcon: qh,
  sortDesc: Oh,
  filtersLabel: Wh,
  facet: Ph,
  facetBtn: Fh,
  facetActive: Hh,
  facetCount: Qh,
  facetCaret: Uh,
  facetMenu: Vh,
  facetOpt: Gh,
  facetOptOn: Kh,
  facetCheck: Xh,
  facetValue: Zh,
  facetOptCount: Yh,
  facetClear: Jh,
  clearAll: ep
};
function tp(n, t) {
  return Object.values(n).join(" ").toLowerCase().includes(t.toLowerCase());
}
function Vv({
  columns: n,
  rows: t,
  rowKey: s,
  onRowClick: a,
  rowLabel: o,
  caption: c,
  empty: i,
  searchable: _,
  searchPlaceholder: f = "Buscar…",
  searchMatch: l = tp,
  loading: d = !1,
  error: u,
  pagination: m,
  minTableWidth: b,
  className: p
}) {
  const [h, v] = S(""), [k, y] = S(null), [w, $] = S("asc"), [C, N] = S({}), [x, j] = S(null), [E, O] = S((m == null ? void 0 : m.defaultPage) ?? 1), [T, B] = S((m == null ? void 0 : m.pageSize) ?? 1), L = Y(null);
  J(() => {
    if (!x) return;
    function D(A) {
      var P;
      (P = L.current) != null && P.contains(A.target) || j(null);
    }
    return document.addEventListener("pointerdown", D), () => document.removeEventListener("pointerdown", D);
  }, [x]);
  const I = n.filter((D) => D.filterable), z = (D) => D.filterValue ?? ((A) => String(A[D.key] ?? "")), M = (D) => Array.isArray(D) ? D : [D];
  function F(D, A) {
    N((P) => {
      const Q = P[D] ?? [];
      if (A === null) return { ...P, [D]: [] };
      const Z = Q.includes(A) ? Q.filter((ie) => ie !== A) : [...Q, A];
      return { ...P, [D]: Z };
    });
  }
  function V(D) {
    D.sortable && (k !== D.key ? (y(D.key), $("asc")) : w === "asc" ? $("desc") : y(null));
  }
  const W = fe(() => {
    let D = t;
    _ && h.trim() && (D = D.filter((A) => l(A, h.trim())));
    for (const A of I) {
      const P = C[A.key];
      if (P != null && P.length) {
        const Q = z(A);
        D = D.filter((Z) => M(Q(Z)).some((ie) => P.includes(ie)));
      }
    }
    if (k) {
      const A = n.find((Z) => Z.key === k), P = (A == null ? void 0 : A.sortValue) ?? ((Z) => Z[k]), Q = w === "asc" ? 1 : -1;
      D = [...D].sort((Z, ie) => {
        const me = P(Z), ae = P(ie);
        return me == null ? 1 : ae == null ? -1 : typeof me == "number" && typeof ae == "number" ? (me - ae) * Q : String(me).localeCompare(String(ae), "pt-BR", { numeric: !0 }) * Q;
      });
    }
    return D;
  }, [t, _, h, l, k, w, n, C]), H = m ? T : Math.max(W.length, 1), G = Math.max(1, Math.ceil(W.length / H)), ce = (m == null ? void 0 : m.page) ?? E, ue = Math.min(Math.max(ce, 1), G), Ye = m ? W.slice((ue - 1) * H, ue * H) : W;
  function U(D) {
    var A;
    (m == null ? void 0 : m.page) == null && O(D), (A = m == null ? void 0 : m.onPageChange) == null || A.call(m, D);
  }
  function K() {
    var D;
    (m == null ? void 0 : m.page) == null && O(1), (D = m == null ? void 0 : m.onPageChange) == null || D.call(m, 1);
  }
  function R(D) {
    B(D), K();
  }
  return /* @__PURE__ */ r("div", { className: g(X.wrap, p), children: [
    _ && /* @__PURE__ */ r("div", { className: X.toolbar, children: [
      /* @__PURE__ */ e("span", { className: X.searchIcon, children: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
        /* @__PURE__ */ e("circle", { cx: "11", cy: "11", r: "7" }),
        /* @__PURE__ */ e("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
      ] }) }),
      /* @__PURE__ */ e(
        "input",
        {
          type: "search",
          className: X.searchInput,
          placeholder: f,
          "aria-label": f,
          value: h,
          onChange: (D) => {
            v(D.target.value), K();
          }
        }
      ),
      h && /* @__PURE__ */ r("span", { className: X.searchCount, children: [
        W.length,
        " de ",
        t.length
      ] })
    ] }),
    I.length > 0 && /* @__PURE__ */ r("div", { className: X.filters, ref: L, onKeyDown: (D) => D.key === "Escape" && j(null), children: [
      /* @__PURE__ */ e("span", { className: X.filtersLabel, children: "Filtros" }),
      I.map((D) => {
        const A = z(D);
        let P = t;
        _ && h.trim() && (P = P.filter((ae) => l(ae, h.trim())));
        for (const ae of I) {
          if (ae.key === D.key) continue;
          const Ie = C[ae.key];
          if (Ie != null && Ie.length) {
            const ht = z(ae);
            P = P.filter((Ct) => M(ht(Ct)).some((un) => Ie.includes(un)));
          }
        }
        const Q = /* @__PURE__ */ new Map();
        for (const ae of t) for (const Ie of M(A(ae))) Q.set(Ie, 0);
        for (const ae of P) for (const Ie of M(A(ae))) Q.set(Ie, (Q.get(Ie) ?? 0) + 1);
        const Z = C[D.key] ?? [], ie = typeof D.header == "string" ? D.header : D.key, me = x === D.key;
        return /* @__PURE__ */ r("div", { className: X.facet, children: [
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: g(X.facetBtn, (Z.length > 0 || me) && X.facetActive),
              "aria-haspopup": "listbox",
              "aria-expanded": me,
              onClick: () => j(me ? null : D.key),
              children: [
                ie,
                Z.length > 0 && /* @__PURE__ */ e("span", { className: X.facetCount, children: Z.length }),
                /* @__PURE__ */ e("svg", { className: X.facetCaret, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) })
              ]
            }
          ),
          me && /* @__PURE__ */ r("div", { role: "listbox", "aria-multiselectable": "true", "aria-label": `Filtrar por ${ie}`, className: X.facetMenu, children: [
            Array.from(Q).map(([ae, Ie]) => {
              const ht = Z.includes(ae);
              return /* @__PURE__ */ r(
                "div",
                {
                  role: "option",
                  "aria-selected": ht,
                  className: g(X.facetOpt, ht && X.facetOptOn),
                  tabIndex: 0,
                  onClick: () => {
                    F(D.key, ae), K();
                  },
                  onKeyDown: (Ct) => {
                    (Ct.key === "Enter" || Ct.key === " ") && (Ct.preventDefault(), F(D.key, ae), K());
                  },
                  children: [
                    /* @__PURE__ */ e("span", { className: X.facetCheck, children: /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" }) }) }),
                    /* @__PURE__ */ e("span", { className: X.facetValue, children: ae }),
                    /* @__PURE__ */ e("span", { className: X.facetOptCount, children: Ie })
                  ]
                },
                ae
              );
            }),
            Z.length > 0 && /* @__PURE__ */ e("button", { type: "button", className: X.facetClear, onClick: () => {
              F(D.key, null), K();
            }, children: "Limpar" })
          ] })
        ] }, D.key);
      }),
      Object.values(C).some((D) => D.length > 0) && /* @__PURE__ */ e("button", { type: "button", className: X.clearAll, onClick: () => {
        N({}), K();
      }, children: "Limpar filtros" })
    ] }),
    /* @__PURE__ */ e("div", { className: X.scroller, "aria-busy": d || void 0, children: /* @__PURE__ */ r("table", { className: X.table, style: { minWidth: b }, children: [
      c && /* @__PURE__ */ e("caption", { className: X.srOnly, children: c }),
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: n.map((D) => {
        const A = k === D.key;
        return /* @__PURE__ */ e(
          "th",
          {
            className: g(X.th, (D.align === "right" || D.align === "num") && X.right),
            style: { width: D.width },
            "aria-sort": A ? w === "asc" ? "ascending" : "descending" : void 0,
            children: D.sortable ? /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: g(X.sortBtn, A && X.sorted),
                onClick: () => V(D),
                children: [
                  D.header,
                  /* @__PURE__ */ e(
                    "svg",
                    {
                      className: g(X.sortIcon, A && w === "desc" && X.sortDesc),
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2.4",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      "aria-hidden": "true",
                      children: A ? /* @__PURE__ */ e("path", { d: "m18 15-6-6-6 6" }) : /* @__PURE__ */ e("path", { d: "M8 9l4-4 4 4M8 15l4 4 4-4" })
                    }
                  )
                ]
              }
            ) : D.header
          },
          D.key
        );
      }) }) }),
      /* @__PURE__ */ e("tbody", { children: d ? Array.from({ length: Math.min((m == null ? void 0 : m.pageSize) ?? 5, 5) }, (D, A) => /* @__PURE__ */ e("tr", { children: n.map((P, Q) => /* @__PURE__ */ e("td", { className: X.td, children: /* @__PURE__ */ e(ea, { width: Q === 0 ? "72%" : Q % 2 ? "54%" : "64%" }) }, P.key)) }, `loading-${A}`)) : u ? /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { className: X.error, colSpan: n.length, role: "alert", children: u }) }) : W.length === 0 ? /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { className: X.empty, colSpan: n.length, children: h || Object.values(C).some((D) => D.length) ? "Nada encontrado com os filtros atuais." : i ?? "Nada por aqui ainda." }) }) : Ye.map((D, A) => /* @__PURE__ */ e(
        "tr",
        {
          className: g(a && X.clickable),
          onClick: a ? (P) => {
            P.target.closest("button, a, input, select, textarea") || a(D);
          } : void 0,
          tabIndex: a ? 0 : void 0,
          "aria-label": a ? o == null ? void 0 : o(D) : void 0,
          onKeyDown: a ? (P) => {
            P.target.closest("button, a, input, select, textarea") || (P.key === "Enter" || P.key === " ") && (P.preventDefault(), a(D));
          } : void 0,
          children: n.map((P) => /* @__PURE__ */ e(
            "td",
            {
              className: g(
                X.td,
                (P.align === "right" || P.align === "num") && X.right,
                P.align === "num" && X.num
              ),
              children: P.cell(D)
            },
            P.key
          ))
        },
        s(D, A)
      )) })
    ] }) }),
    m && !d && !u && W.length > 0 && /* @__PURE__ */ r("div", { className: X.paginationBar, children: [
      /* @__PURE__ */ r("div", { className: X.paginationMeta, children: [
        /* @__PURE__ */ r("p", { className: X.paginationSummary, "aria-live": "polite", children: [
          Math.min((ue - 1) * H + 1, W.length),
          "–",
          Math.min(ue * H, W.length),
          " de ",
          W.length
        ] }),
        m.pageSizeOptions && m.pageSizeOptions.length > 0 && /* @__PURE__ */ r("div", { className: X.pageSizeControl, children: [
          /* @__PURE__ */ e("span", { children: "Por página" }),
          /* @__PURE__ */ e(
            Tm,
            {
              block: !1,
              "aria-label": "Registros por página",
              value: H,
              onChange: (D) => R(Number(D.target.value)),
              children: Array.from(/* @__PURE__ */ new Set([m.pageSize, ...m.pageSizeOptions])).map((D) => /* @__PURE__ */ e("option", { value: D, children: D }, D))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e(fh, { page: ue, pageCount: G, onPageChange: U })
    ] })
  ] });
}
const np = "_field_11eez_1", ap = "_label_11eez_10", sp = "_wrap_11eez_19", rp = "_shell_11eez_25", op = "_open_11eez_34", cp = "_hasError_11eez_39", lp = "_disabled_11eez_46", ip = "_inputWrap_11eez_52", dp = "_icon_11eez_60", _p = "_input_11eez_52", up = "_clear_11eez_88", mp = "_pop_11eez_119", hp = "_section_11eez_145", pp = "_sectionLabel_11eez_149", fp = "_row_11eez_158", bp = "_active_11eez_169", gp = "_rowDisabled_11eez_172", vp = "_lead_11eez_177", yp = "_avatarWrap_11eez_193", kp = "_rowText_11eez_199", Np = "_rowLabel_11eez_207", $p = "_description_11eez_214", wp = "_mark_11eez_226", xp = "_meta_11eez_232", Cp = "_kbd_11eez_243", Lp = "_empty_11eez_256", zp = "_help_11eez_263", Mp = "_helpError_11eez_269", ne = {
  field: np,
  label: ap,
  wrap: sp,
  shell: rp,
  open: op,
  hasError: cp,
  disabled: lp,
  inputWrap: ip,
  icon: dp,
  input: _p,
  clear: up,
  pop: mp,
  section: hp,
  sectionLabel: pp,
  row: fp,
  active: bp,
  rowDisabled: gp,
  lead: vp,
  avatarWrap: yp,
  rowText: kp,
  rowLabel: Np,
  description: $p,
  mark: wp,
  meta: xp,
  kbd: Cp,
  empty: Lp,
  help: zp,
  helpError: Mp
}, Dp = (n, t) => n.label.toLowerCase().includes(t.toLowerCase());
function Ip(n) {
  const t = n.trim().split(/\s+/).filter(Boolean);
  if (t.length === 0) return "?";
  const s = t[0][0] ?? "", a = t.length > 1 ? t[t.length - 1][0] ?? "" : "";
  return (s + a).toUpperCase();
}
function Fn({ avatar: n }) {
  return /* @__PURE__ */ e("span", { className: ne.avatarWrap, "aria-hidden": "true", children: /* @__PURE__ */ e(Ze, { size: "sm", src: n.src, alt: "", initials: Ip(n.name), color: n.color }) });
}
function jp(n, t) {
  const s = t.trim();
  if (!s) return n;
  const a = n.toLowerCase().indexOf(s.toLowerCase());
  return a < 0 ? n : /* @__PURE__ */ r(He, { children: [
    n.slice(0, a),
    /* @__PURE__ */ e("mark", { className: ne.mark, children: n.slice(a, a + s.length) }),
    n.slice(a + s.length)
  ] });
}
const Ep = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ e("circle", { cx: "11", cy: "11", r: "7" }),
  /* @__PURE__ */ e("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
] }), Gv = te(function({
  options: t,
  value: s,
  defaultValue: a = null,
  onChange: o,
  inputValue: c,
  onInputValueChange: i,
  label: _,
  filter: f = !0,
  icon: l = Ep,
  emptyMessage: d = "Nenhum resultado",
  clearable: u = !0,
  error: m,
  hint: b,
  disabled: p,
  placeholder: h = "Buscar…",
  className: v,
  id: k,
  ...y
}, w) {
  const $ = be(), C = k || `${$}-input`, N = `${$}-listbox`, [x, j] = S(a), E = s !== void 0 ? s : x, O = fe(
    () => t.find((A) => A.value === E) ?? null,
    [t, E]
  ), [T, B] = S((O == null ? void 0 : O.label) ?? ""), L = c !== void 0 ? c : T;
  function I(A) {
    c === void 0 && B(A), i == null || i(A);
  }
  const [z, M] = S(!1), [F, V] = S(0), W = Y(null), H = O && L === O.label ? "" : L, G = fe(() => {
    if (f === !1) return t;
    const A = f === !0 ? Dp : f;
    return H.trim() ? t.filter((P) => A(P, H)) : t;
  }, [t, f, H]), ce = fe(() => {
    const A = /* @__PURE__ */ new Map();
    for (const P of G) {
      const Q = P.group ?? "";
      A.has(Q) || A.set(Q, []), A.get(Q).push(P);
    }
    return Array.from(A, ([P, Q]) => ({ group: P, items: Q }));
  }, [G]), ue = G[F] ?? null, Ye = ue ? `${$}-opt-${F}` : void 0;
  J(() => {
    F >= G.length && V(0);
  }, [G.length, F]), J(() => {
    var A;
    z && Ye && ((A = document.getElementById(Ye)) == null || A.scrollIntoView({ block: "nearest" }));
  }, [z, Ye]), J(() => {
    if (!z) return;
    function A(P) {
      var Q;
      (Q = W.current) != null && Q.contains(P.target) || M(!1);
    }
    return document.addEventListener("pointerdown", A), () => document.removeEventListener("pointerdown", A);
  }, [z]);
  function U(A) {
    A.disabled || (s === void 0 && j(A.value), I(A.label), o == null || o(A), M(!1));
  }
  function K() {
    var A;
    s === void 0 && j(null), I(""), o == null || o(null), V(0), (A = document.getElementById(C)) == null || A.focus();
  }
  function R(A) {
    switch (A.key) {
      case "ArrowDown":
        A.preventDefault(), z ? V((P) => Math.min(P + 1, G.length - 1)) : M(!0);
        break;
      case "ArrowUp":
        A.preventDefault(), z ? V((P) => Math.max(P - 1, 0)) : M(!0);
        break;
      case "Home":
        z && (A.preventDefault(), V(0));
        break;
      case "End":
        z && (A.preventDefault(), V(G.length - 1));
        break;
      case "Enter":
        z && ue && (A.preventDefault(), U(ue));
        break;
      case "Escape":
        A.preventDefault(), z ? M(!1) : L && K();
        break;
      case "Tab":
        M(!1);
        break;
    }
  }
  let D = -1;
  return /* @__PURE__ */ r("div", { className: g(ne.field, v), children: [
    _ && /* @__PURE__ */ e("label", { className: ne.label, htmlFor: C, children: _ }),
    /* @__PURE__ */ e(
      "div",
      {
        ref: W,
        className: g(
          ne.wrap,
          z && ne.open,
          m && ne.hasError,
          p && ne.disabled
        ),
        children: /* @__PURE__ */ r("div", { className: ne.shell, children: [
          /* @__PURE__ */ r("div", { className: ne.inputWrap, children: [
            O != null && O.avatar && L === O.label ? /* @__PURE__ */ e(Fn, { avatar: O.avatar }) : /* @__PURE__ */ e("span", { className: ne.icon, children: l }),
            /* @__PURE__ */ e(
              "input",
              {
                ...y,
                ref: w,
                id: C,
                className: ne.input,
                role: "combobox",
                "aria-expanded": z,
                "aria-controls": N,
                "aria-autocomplete": "list",
                "aria-activedescendant": z ? Ye : void 0,
                "aria-invalid": m ? !0 : void 0,
                autoComplete: "off",
                spellCheck: !1,
                placeholder: h,
                disabled: p,
                value: L,
                onChange: (A) => {
                  I(A.target.value), M(!0), V(0);
                },
                onFocus: () => M(!0),
                onKeyDown: R
              }
            ),
            u && L && !p && /* @__PURE__ */ e("button", { type: "button", className: ne.clear, "aria-label": "Limpar", onClick: K, children: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", "aria-hidden": "true", children: [
              /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
              /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" })
            ] }) })
          ] }),
          z && /* @__PURE__ */ e("div", { id: N, role: "listbox", className: ne.pop, "aria-label": _ || h, children: G.length === 0 ? /* @__PURE__ */ e("div", { className: ne.empty, children: d }) : ce.map(({ group: A, items: P }) => /* @__PURE__ */ r("div", { className: ne.section, children: [
            A && /* @__PURE__ */ e("div", { className: ne.sectionLabel, children: A }),
            P.map((Q) => {
              D += 1;
              const Z = D, ie = Z === F;
              return /* @__PURE__ */ r(
                "div",
                {
                  id: `${$}-opt-${Z}`,
                  role: "option",
                  "aria-selected": Q.value === E,
                  "aria-disabled": Q.disabled || void 0,
                  className: g(
                    ne.row,
                    ie && ne.active,
                    Q.disabled && ne.rowDisabled
                  ),
                  onMouseEnter: () => V(Z),
                  onMouseDown: (me) => me.preventDefault(),
                  onClick: () => U(Q),
                  children: [
                    Q.avatar ? /* @__PURE__ */ e(Fn, { avatar: Q.avatar }) : Q.lead && /* @__PURE__ */ e("span", { className: ne.lead, children: Q.lead }),
                    /* @__PURE__ */ r("span", { className: ne.rowText, children: [
                      /* @__PURE__ */ e("span", { className: ne.rowLabel, children: jp(Q.label, H) }),
                      Q.description && /* @__PURE__ */ e("span", { className: ne.description, children: Q.description })
                    ] }),
                    Q.meta && /* @__PURE__ */ e("span", { className: ne.meta, children: Q.meta }),
                    ie && /* @__PURE__ */ e("kbd", { className: ne.kbd, children: "↵" })
                  ]
                },
                Q.value
              );
            })
          ] }, A || "__default")) })
        ] })
      }
    ),
    (m || b) && /* @__PURE__ */ e("p", { className: g(ne.help, m && ne.helpError), children: m || b })
  ] });
}), Bp = "_wrap_o6qez_1", Ap = "_card_o6qez_6", Hn = {
  wrap: Bp,
  card: Ap
};
function Sp({
  content: n,
  children: t,
  openDelay: s = 500,
  closeDelay: a = 200,
  side: o = "bottom",
  className: c
}) {
  const [i, _] = S(!1), f = Y(void 0);
  J(() => () => clearTimeout(f.current), []);
  function l(d, u) {
    clearTimeout(f.current), f.current = setTimeout(() => _(d), u);
  }
  return /* @__PURE__ */ r(
    "div",
    {
      className: g(Hn.wrap, c),
      onMouseEnter: () => l(!0, s),
      onMouseLeave: () => l(!1, a),
      onFocus: () => l(!0, 0),
      onBlur: () => l(!1, 0),
      onKeyDown: (d) => {
        d.key === "Escape" && (clearTimeout(f.current), _(!1));
      },
      children: [
        t,
        i && /* @__PURE__ */ e("div", { "data-side": o, className: Hn.card, children: n })
      ]
    }
  );
}
const Rp = "_field_1gvq7_1", Tp = "_head_1gvq7_9", qp = "_label_1gvq7_15", Op = "_tip_1gvq7_24", Wp = "_helpContent_1gvq7_27", Pp = "_learnMore_1gvq7_28", Fp = "_srOnly_1gvq7_59", zt = {
  field: Rp,
  head: Tp,
  label: qp,
  tip: Op,
  helpContent: Wp,
  learnMore: Pp,
  srOnly: Fp
}, Hp = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "9" }),
  /* @__PURE__ */ e("path", { d: "M9.2 9a2.9 2.9 0 0 1 5.6 1c0 1.8-2.8 2.2-2.8 3.6" }),
  /* @__PURE__ */ e("line", { x1: "12", y1: "17", x2: "12", y2: "17.01" })
] });
function Kv({
  label: n,
  helpText: t,
  children: s,
  onLearnMore: a,
  learnMoreLabel: o = "Saber mais",
  htmlFor: c,
  side: i = "top",
  className: _
}) {
  const l = `${be()}-help`, d = Nn(s) ? $n(s, {
    "aria-describedby": g(
      s.props["aria-describedby"],
      l
    )
  }) : s;
  return /* @__PURE__ */ r("div", { className: g(zt.field, _), children: [
    /* @__PURE__ */ r("div", { className: zt.head, children: [
      /* @__PURE__ */ e("label", { className: zt.label, htmlFor: c, children: n }),
      /* @__PURE__ */ e("span", { className: zt.tip, children: /* @__PURE__ */ e(Sp, { side: i === "bottom" ? "bottom" : "top", openDelay: 160, content: /* @__PURE__ */ r("div", { className: zt.helpContent, children: [
        /* @__PURE__ */ e("span", { children: t }),
        a && /* @__PURE__ */ e("button", { type: "button", className: zt.learnMore, onClick: a, children: o })
      ] }), children: /* @__PURE__ */ e(ge, { size: "sm", "aria-label": `Ajuda: ${n}`, icon: Hp }) }) })
    ] }),
    d,
    /* @__PURE__ */ e("span", { id: l, className: zt.srOnly, children: t })
  ] });
}
const Qp = "_block_fk1kd_1", Up = "_disabled_fk1kd_6", Vp = "_row_fk1kd_11", Gp = "_name_fk1kd_17", Kp = "_readout_fk1kd_22", Xp = "_slider_fk1kd_31", Zp = "_track_fk1kd_39", Yp = "_fill_fk1kd_40", Jp = "_stepDot_fk1kd_58", e2 = "_thumb_fk1kd_70", t2 = "_dragging_fk1kd_90", n2 = "_ticks_fk1kd_102", a2 = "_stepLabels_fk1kd_113", qe = {
  block: Qp,
  disabled: Up,
  row: Vp,
  name: Gp,
  readout: Kp,
  slider: Xp,
  track: Zp,
  fill: Yp,
  stepDot: Jp,
  thumb: e2,
  dragging: t2,
  ticks: n2,
  stepLabels: a2
}, pn = (n, t, s) => Math.min(s, Math.max(t, n)), Xv = te(function({
  min: t = 0,
  max: s = 100,
  step: a = 1,
  value: o,
  defaultValue: c,
  onChange: i,
  label: _,
  formatValue: f = String,
  showValue: l = !0,
  ticks: d,
  marks: u,
  disabled: m,
  className: b,
  ...p
}, h) {
  const v = be(), k = Y(null), [y, w] = S(c ?? t), [$, C] = S(!1), N = pn(o !== void 0 ? o : y, t, s), x = s === t ? 0 : (N - t) / (s - t) * 100;
  function j(z) {
    const M = pn(Math.round((z - t) / a) * a + t, t, s), F = (String(a).split(".")[1] ?? "").length, V = Number(M.toFixed(F));
    V !== N && (o === void 0 && w(V), i == null || i(V));
  }
  function E(z) {
    const M = k.current.getBoundingClientRect(), F = pn((z.clientX - M.left) / M.width, 0, 1);
    return t + F * (s - t);
  }
  function O(z) {
    var M, F;
    m || (z.preventDefault(), z.currentTarget.setPointerCapture(z.pointerId), C(!0), j(E(z)), (F = (M = k.current) == null ? void 0 : M.querySelector("[role=slider]")) == null || F.focus());
  }
  function T(z) {
    !$ || m || j(E(z));
  }
  function B(z) {
    if (m) return;
    const M = z.shiftKey ? a * 10 : a;
    switch (z.key) {
      case "ArrowRight":
      case "ArrowUp":
        z.preventDefault(), j(N + M);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        z.preventDefault(), j(N - M);
        break;
      case "Home":
        z.preventDefault(), j(t);
        break;
      case "End":
        z.preventDefault(), j(s);
        break;
      case "PageUp":
        z.preventDefault(), j(N + a * 10);
        break;
      case "PageDown":
        z.preventDefault(), j(N - a * 10);
        break;
    }
  }
  const L = u ? u.length - 1 : 0, I = f(N);
  return /* @__PURE__ */ r("div", { ref: h, className: g(qe.block, m && qe.disabled, b), ...p, children: [
    (_ || l) && /* @__PURE__ */ r("div", { className: qe.row, children: [
      _ && /* @__PURE__ */ e("span", { className: qe.name, id: `${v}-label`, children: _ }),
      l && /* @__PURE__ */ e("span", { className: qe.readout, children: I })
    ] }),
    /* @__PURE__ */ r(
      "div",
      {
        ref: k,
        className: qe.slider,
        onPointerDown: O,
        onPointerMove: T,
        onPointerUp: () => C(!1),
        onPointerCancel: () => C(!1),
        children: [
          /* @__PURE__ */ e("div", { className: qe.track }),
          /* @__PURE__ */ e("div", { className: qe.fill, style: { width: `${x}%` } }),
          u && u.map((z, M) => /* @__PURE__ */ e("span", { className: qe.stepDot, style: { left: `${M / L * 100}%` } }, M)),
          /* @__PURE__ */ e(
            "div",
            {
              role: "slider",
              tabIndex: m ? -1 : 0,
              "aria-labelledby": _ ? `${v}-label` : void 0,
              "aria-valuemin": t,
              "aria-valuemax": s,
              "aria-valuenow": N,
              "aria-valuetext": u ? u[Math.round((N - t) / a)] ?? I : I,
              "aria-disabled": m || void 0,
              className: g(qe.thumb, $ && qe.dragging),
              style: { left: `${x}%` },
              onKeyDown: B
            }
          )
        ]
      }
    ),
    u ? /* @__PURE__ */ e("div", { className: qe.stepLabels, children: u.map((z) => /* @__PURE__ */ e("span", { children: z }, z)) }) : d && /* @__PURE__ */ r("div", { className: qe.ticks, "aria-hidden": "true", children: [
      /* @__PURE__ */ e("span", { children: d[0] }),
      /* @__PURE__ */ e("span", { children: d[1] })
    ] })
  ] });
}), s2 = "_block_aww93_1", r2 = "_otp_aww93_8", o2 = "_cell_aww93_13", c2 = "_hasError_aww93_38", l2 = "_disabled_aww93_45", i2 = "_sep_aww93_51", d2 = "_help_aww93_58", Mt = {
  block: s2,
  otp: r2,
  cell: o2,
  hasError: c2,
  disabled: l2,
  sep: i2,
  help: d2
}, Zv = te(function({
  length: t = 6,
  groupSize: s,
  value: a,
  defaultValue: o = "",
  onChange: c,
  onComplete: i,
  alphanumeric: _ = !1,
  label: f = "Código de verificação",
  error: l,
  disabled: d,
  autoFocus: u,
  className: m,
  ...b
}, p) {
  const [h, v] = S(o.slice(0, t)), k = (a !== void 0 ? a : h).slice(0, t), y = Y([]), w = _ ? /[a-zA-Z0-9]/ : /[0-9]/;
  function $(T) {
    a === void 0 && v(T), c == null || c(T), T.length === t && !T.includes(" ") && (i == null || i(T));
  }
  function C(T, B) {
    const L = Array.from({ length: t }, (I, z) => k[z] ?? " ");
    L[T] = B, $(L.join("").replace(/\s+$/, ""));
  }
  function N(T) {
    var B;
    (B = y.current[Math.max(0, Math.min(t - 1, T))]) == null || B.select();
  }
  function x(T, B) {
    const L = B.split("").filter((z) => w.test(z));
    if (!L.length) return;
    if (L.length === 1) {
      C(T, L[0]), N(T + 1);
      return;
    }
    const I = Array.from({ length: t }, (z, M) => k[M] ?? " ");
    L.slice(0, t - T).forEach((z, M) => {
      I[T + M] = z;
    }), $(I.join("").replace(/\s+$/, "")), N(T + L.length);
  }
  function j(T, B) {
    switch (B.key) {
      case "Backspace":
        B.preventDefault(), k[T] && k[T] !== " " ? C(T, " ") : (C(T - 1 >= 0 ? T - 1 : 0, " "), N(T - 1));
        break;
      case "ArrowLeft":
        B.preventDefault(), N(T - 1);
        break;
      case "ArrowRight":
        B.preventDefault(), N(T + 1);
        break;
    }
  }
  const E = Array.from({ length: t }, (T, B) => {
    const L = k[B] && k[B] !== " " ? k[B] : "";
    return /* @__PURE__ */ e(
      "input",
      {
        ref: (I) => {
          y.current[B] = I;
        },
        className: Mt.cell,
        type: "text",
        inputMode: _ ? "text" : "numeric",
        autoComplete: B === 0 ? "one-time-code" : "off",
        maxLength: t,
        "aria-label": `Dígito ${B + 1} de ${t}`,
        "aria-invalid": l ? !0 : void 0,
        disabled: d,
        autoFocus: u && B === 0,
        value: L,
        onChange: (I) => x(B, I.target.value),
        onKeyDown: (I) => j(B, I),
        onFocus: (I) => I.target.select()
      },
      B
    );
  }), O = [];
  return E.forEach((T, B) => {
    s && B > 0 && B % s === 0 && O.push(
      /* @__PURE__ */ e("span", { className: Mt.sep, "aria-hidden": "true", children: "—" }, `sep-${B}`)
    ), O.push(T);
  }), /* @__PURE__ */ r("div", { className: g(Mt.block, m), ...b, children: [
    /* @__PURE__ */ e(
      "div",
      {
        ref: p,
        role: "group",
        "aria-label": f,
        className: g(Mt.otp, l && Mt.hasError, d && Mt.disabled),
        children: O
      }
    ),
    l && /* @__PURE__ */ e("p", { className: Mt.help, children: l })
  ] });
}), _2 = "_backdrop_1ti58_1", u2 = "_command_1ti58_21", m2 = "_inputRow_1ti58_43", h2 = "_searchIcon_1ti58_50", p2 = "_input_1ti58_43", f2 = "_list_1ti58_70", b2 = "_groupLabel_1ti58_76", g2 = "_item_1ti58_85", v2 = "_active_1ti58_96", y2 = "_itemDisabled_1ti58_99", k2 = "_icon_1ti58_104", N2 = "_lead_1ti58_116", $2 = "_label_1ti58_131", w2 = "_mark_1ti58_139", x2 = "_shortcut_1ti58_144", C2 = "_empty_1ti58_148", ke = {
  backdrop: _2,
  command: u2,
  inputRow: m2,
  searchIcon: h2,
  input: p2,
  list: f2,
  groupLabel: b2,
  item: g2,
  active: v2,
  itemDisabled: y2,
  icon: k2,
  lead: N2,
  label: $2,
  mark: w2,
  shortcut: x2,
  empty: C2
};
function L2(n, t) {
  const s = t.trim();
  if (!s) return n;
  const a = n.toLowerCase().indexOf(s.toLowerCase());
  return a < 0 ? n : /* @__PURE__ */ r(He, { children: [
    n.slice(0, a),
    /* @__PURE__ */ e("b", { className: ke.mark, children: n.slice(a, a + s.length) }),
    n.slice(a + s.length)
  ] });
}
function Yv({
  open: n,
  onOpenChange: t,
  items: s,
  onSelect: a,
  placeholder: o = "Buscar comandos…",
  emptyMessage: c = "Nenhum resultado",
  className: i
}) {
  const [_, f] = S(""), [l, d] = S(0), u = Y(null), m = Y(null);
  J(() => {
    n && (f(""), d(0), requestAnimationFrame(() => {
      var w;
      return (w = u.current) == null ? void 0 : w.focus();
    }));
  }, [n]);
  const b = fe(() => {
    const w = _.trim().toLowerCase();
    return w ? s.filter(
      ($) => {
        var C;
        return $.label.toLowerCase().includes(w) || ((C = $.keywords) == null ? void 0 : C.toLowerCase().includes(w));
      }
    ) : s;
  }, [s, _]), p = fe(() => {
    const w = /* @__PURE__ */ new Map();
    for (const $ of b) {
      const C = $.group ?? "";
      w.has(C) || w.set(C, []), w.get(C).push($);
    }
    return Array.from(w, ([$, C]) => ({ group: $, list: C }));
  }, [b]), h = b[l] ?? null;
  J(() => {
    l >= b.length && d(0);
  }, [b.length, l]), J(() => {
    var w, $;
    ($ = (w = m.current) == null ? void 0 : w.querySelector(`[data-index="${l}"]`)) == null || $.scrollIntoView({ block: "nearest" });
  }, [l]);
  function v(w) {
    var $;
    w.disabled || (($ = w.onSelect) == null || $.call(w), a == null || a(w), t(!1));
  }
  function k(w) {
    switch (w.key) {
      case "ArrowDown":
        w.preventDefault(), d(($) => Math.min($ + 1, b.length - 1));
        break;
      case "ArrowUp":
        w.preventDefault(), d(($) => Math.max($ - 1, 0));
        break;
      case "Enter":
        h && (w.preventDefault(), v(h));
        break;
      case "Escape":
        w.preventDefault(), t(!1);
        break;
    }
  }
  if (!n) return null;
  let y = -1;
  return /* @__PURE__ */ e("div", { className: ke.backdrop, onClick: () => t(!1), children: /* @__PURE__ */ r(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Paleta de comandos",
      className: g(ke.command, i),
      onClick: (w) => w.stopPropagation(),
      onKeyDown: k,
      children: [
        /* @__PURE__ */ r("div", { className: ke.inputRow, children: [
          /* @__PURE__ */ r("svg", { className: ke.searchIcon, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
            /* @__PURE__ */ e("circle", { cx: "11", cy: "11", r: "8" }),
            /* @__PURE__ */ e("path", { d: "m21 21-4.3-4.3" })
          ] }),
          /* @__PURE__ */ e(
            "input",
            {
              ref: u,
              className: ke.input,
              role: "combobox",
              "aria-expanded": "true",
              "aria-controls": "command-list",
              "aria-autocomplete": "list",
              "aria-activedescendant": h ? `cmd-opt-${l}` : void 0,
              placeholder: o,
              value: _,
              onChange: (w) => {
                f(w.target.value), d(0);
              }
            }
          ),
          /* @__PURE__ */ e(nn, { children: "esc" })
        ] }),
        /* @__PURE__ */ e("div", { id: "command-list", ref: m, role: "listbox", "aria-label": "Resultados", className: ke.list, children: b.length === 0 ? /* @__PURE__ */ e("div", { className: ke.empty, children: c }) : p.map(({ group: w, list: $ }) => /* @__PURE__ */ r("div", { children: [
          w && /* @__PURE__ */ e("div", { className: ke.groupLabel, children: w }),
          $.map((C) => {
            y += 1;
            const N = y, x = N === l;
            return /* @__PURE__ */ r(
              "div",
              {
                id: `cmd-opt-${N}`,
                "data-index": N,
                role: "option",
                "aria-selected": x,
                "aria-disabled": C.disabled || void 0,
                className: g(ke.item, x && ke.active, C.disabled && ke.itemDisabled),
                onMouseEnter: () => d(N),
                onMouseDown: (j) => j.preventDefault(),
                onClick: () => v(C),
                children: [
                  C.icon && /* @__PURE__ */ e("span", { className: ke.icon, children: C.icon }),
                  C.lead && /* @__PURE__ */ e("span", { className: ke.lead, children: C.lead }),
                  /* @__PURE__ */ e("span", { className: ke.label, children: L2(C.label, _) }),
                  C.shortcut && /* @__PURE__ */ e(nn, { className: ke.shortcut, children: C.shortcut })
                ]
              },
              C.id
            );
          })
        ] }, w || "__default")) })
      ]
    }
  ) });
}
const z2 = "_scrim_13kxe_1", M2 = "_panel_13kxe_17", D2 = "_left_13kxe_27", I2 = "_right_13kxe_28", j2 = "_bottom_13kxe_44", E2 = "_grab_13kxe_81", B2 = "_head_13kxe_91", A2 = "_title_13kxe_103", S2 = "_close_13kxe_112", R2 = "_body_13kxe_117", T2 = "_foot_13kxe_127", _t = {
  scrim: z2,
  "scrim-in": "_scrim-in_13kxe_1",
  panel: M2,
  left: D2,
  right: I2,
  "slide-left": "_slide-left_13kxe_1",
  "slide-right": "_slide-right_13kxe_1",
  bottom: j2,
  "slide-up": "_slide-up_13kxe_1",
  grab: E2,
  head: B2,
  title: A2,
  close: S2,
  body: R2,
  foot: T2
};
function Jv({
  open: n,
  onOpenChange: t,
  side: s = "right",
  title: a,
  footer: o,
  width: c,
  children: i,
  hideClose: _,
  className: f
}) {
  const l = Y(null), d = be();
  return sa(n, l, () => t(!1)), n ? /* @__PURE__ */ r(He, { children: [
    /* @__PURE__ */ e("div", { className: _t.scrim, "aria-hidden": "true", onClick: () => t(!1) }),
    /* @__PURE__ */ r(
      "div",
      {
        ref: l,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": a ? d : void 0,
        "aria-label": a ? void 0 : "Painel",
        tabIndex: -1,
        className: g(_t.panel, _t[s], f),
        style: s === "bottom" || c == null ? void 0 : { width: c },
        children: [
          s === "bottom" && /* @__PURE__ */ e("span", { className: _t.grab, "aria-hidden": "true" }),
          (a || !_) && /* @__PURE__ */ r("div", { className: _t.head, children: [
            a && /* @__PURE__ */ e("h2", { id: d, className: _t.title, children: a }),
            !_ && /* @__PURE__ */ e(
              ge,
              {
                size: "sm",
                "aria-label": "Fechar",
                className: _t.close,
                onClick: () => t(!1),
                icon: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": "true", children: [
                  /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
                  /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" })
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ e("div", { className: _t.body, children: i }),
          o && /* @__PURE__ */ e("div", { className: _t.foot, children: o })
        ]
      }
    )
  ] }) : null;
}
const q2 = "_region_1mjcd_1", O2 = "_bottom_right_1mjcd_12", W2 = "_bottom_left_1mjcd_16", P2 = "_top_right_1mjcd_20", F2 = "_toast_1mjcd_25", H2 = "_icon_1mjcd_50", Q2 = "_success_1mjcd_60", U2 = "_danger_1mjcd_63", V2 = "_textBlock_1mjcd_67", G2 = "_title_1mjcd_71", K2 = "_desc_1mjcd_75", X2 = "_action_1mjcd_82", Z2 = "_close_1mjcd_104", st = {
  region: q2,
  bottom_right: O2,
  bottom_left: W2,
  top_right: P2,
  toast: F2,
  "toast-in": "_toast-in_1mjcd_1",
  icon: H2,
  success: Q2,
  danger: U2,
  textBlock: V2,
  title: G2,
  desc: K2,
  action: X2,
  close: Z2
}, Y2 = {
  success: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ e("polyline", { points: "8.5 12.5 11 15 15.5 9.5" })
  ] }),
  danger: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ e("line", { x1: "12", y1: "7.5", x2: "12", y2: "13" }),
    /* @__PURE__ */ e("line", { x1: "12", y1: "16.5", x2: "12.01", y2: "16.5" })
  ] })
};
function J2({ id: n, title: t, description: s, tone: a = "default", action: o, duration: c = 5e3, onDismiss: i }) {
  return J(() => {
    if (c === null || !i) return;
    const _ = setTimeout(() => i(n), c);
    return () => clearTimeout(_);
  }, [n, c, i]), /* @__PURE__ */ r("div", { className: st.toast, role: "status", children: [
    a !== "default" && /* @__PURE__ */ e("span", { className: g(st.icon, st[a]), children: Y2[a] }),
    /* @__PURE__ */ r("div", { className: st.textBlock, children: [
      /* @__PURE__ */ e("div", { className: st.title, children: t }),
      s && /* @__PURE__ */ e("div", { className: st.desc, children: s })
    ] }),
    o && /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: st.action,
        onClick: () => {
          o.onClick(), i == null || i(n);
        },
        children: o.label
      }
    ),
    i && /* @__PURE__ */ e("button", { type: "button", className: st.close, "aria-label": "Fechar", onClick: () => i(n), children: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
      /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" })
    ] }) })
  ] });
}
function e6({ toasts: n, onDismiss: t, position: s = "bottom-right", className: a }) {
  return /* @__PURE__ */ e("div", { "aria-live": "polite", className: g(st.region, st[s.replace("-", "_")], a), children: n.map((o) => /* @__PURE__ */ e(J2, { ...o, onDismiss: t }, o.id)) });
}
const e0 = "_snackbar_187bg_1", t0 = "_message_187bg_25", n0 = "_action_187bg_29", fn = {
  snackbar: e0,
  message: t0,
  action: n0
};
function t6({ children: n, action: t, className: s }) {
  return /* @__PURE__ */ r("div", { className: g(fn.snackbar, s), role: "status", children: [
    /* @__PURE__ */ e("span", { className: fn.message, children: n }),
    t && /* @__PURE__ */ e("button", { type: "button", className: fn.action, onClick: t.onClick, children: t.label })
  ] });
}
const a0 = "_wrap_1gup1_1", s0 = "_bellWrap_1gup1_8", r0 = "_bellOpen_1gup1_12", o0 = "_badge_1gup1_17", c0 = "_pop_1gup1_48", l0 = "_head_1gup1_72", i0 = "_title_1gup1_80", d0 = "_markAll_1gup1_88", _0 = "_list_1gup1_103", u0 = "_item_1gup1_109", m0 = "_dot_1gup1_127", h0 = "_itemUnread_1gup1_135", p0 = "_itemBody_1gup1_139", f0 = "_itemTitle_1gup1_146", b0 = "_itemDesc_1gup1_156", g0 = "_time_1gup1_162", v0 = "_empty_1gup1_170", pe = {
  wrap: a0,
  bellWrap: s0,
  bellOpen: r0,
  badge: o0,
  pop: c0,
  head: l0,
  title: i0,
  markAll: d0,
  list: _0,
  item: u0,
  dot: m0,
  itemUnread: h0,
  itemBody: p0,
  itemTitle: f0,
  itemDesc: b0,
  time: g0,
  empty: v0
};
function n6({
  items: n,
  onItemClick: t,
  onMarkAllRead: s,
  title: a = "Notificações",
  emptyMessage: o = "Nenhuma notificação",
  className: c
}) {
  const [i, _] = S(!1), f = Y(null), l = n.filter((d) => d.unread).length;
  return J(() => {
    if (!i) return;
    function d(m) {
      var b;
      (b = f.current) != null && b.contains(m.target) || _(!1);
    }
    function u(m) {
      m.key === "Escape" && _(!1);
    }
    return document.addEventListener("pointerdown", d), document.addEventListener("keydown", u), () => {
      document.removeEventListener("pointerdown", d), document.removeEventListener("keydown", u);
    };
  }, [i]), /* @__PURE__ */ r("div", { ref: f, className: g(pe.wrap, c), children: [
    /* @__PURE__ */ r("span", { className: pe.bellWrap, children: [
      /* @__PURE__ */ e(
        ge,
        {
          size: "lg",
          "aria-label": l ? `Notificações: ${l} não lidas` : "Notificações",
          "aria-haspopup": "dialog",
          "aria-expanded": i,
          className: g(i && pe.bellOpen),
          onClick: () => _((d) => !d),
          icon: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
            /* @__PURE__ */ e("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }),
            /* @__PURE__ */ e("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" })
          ] })
        }
      ),
      l > 0 && /* @__PURE__ */ e("span", { className: pe.badge, children: l > 9 ? "9+" : l })
    ] }),
    i && /* @__PURE__ */ r("div", { role: "dialog", "aria-label": a, className: pe.pop, children: [
      /* @__PURE__ */ r("div", { className: pe.head, children: [
        /* @__PURE__ */ e("span", { className: pe.title, children: a }),
        s && l > 0 && /* @__PURE__ */ e("button", { type: "button", className: pe.markAll, onClick: s, children: "Marcar todas como lidas" })
      ] }),
      /* @__PURE__ */ e("div", { className: pe.list, children: n.length === 0 ? /* @__PURE__ */ e("div", { className: pe.empty, children: o }) : n.map((d) => /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: g(pe.item, d.unread && pe.itemUnread),
          onClick: () => {
            t == null || t(d), _(!1);
          },
          children: [
            /* @__PURE__ */ e("span", { className: pe.dot, "aria-hidden": "true" }),
            /* @__PURE__ */ r("span", { className: pe.itemBody, children: [
              /* @__PURE__ */ e("span", { className: pe.itemTitle, children: d.title }),
              d.description && /* @__PURE__ */ e("span", { className: pe.itemDesc, children: d.description })
            ] }),
            d.time && /* @__PURE__ */ e("span", { className: pe.time, children: d.time })
          ]
        },
        d.id
      )) })
    ] })
  ] });
}
const y0 = "_open_b83v1_2", k0 = {
  open: y0
}, N0 = [
  { id: "docs", label: "Documentação" },
  { id: "shortcuts", label: "Atalhos de teclado", shortcut: "⌘K" },
  { type: "separator" },
  { id: "support", label: "Falar com suporte" }
];
function a6({ entries: n = N0, onSelect: t, label: s = "Ajuda", className: a }) {
  const [o, c] = S(!1);
  return /* @__PURE__ */ e(
    an,
    {
      open: o,
      onOpenChange: c,
      entries: n,
      onSelect: t,
      align: "end",
      className: a,
      children: /* @__PURE__ */ e(
        ge,
        {
          size: "lg",
          "aria-label": s,
          "aria-haspopup": "menu",
          "aria-expanded": o,
          className: g(o && k0.open),
          onClick: () => c((i) => !i),
          icon: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
            /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ e("path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }),
            /* @__PURE__ */ e("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
          ] })
        }
      )
    }
  );
}
const $0 = "_block_141ix_1", w0 = "_canvas_141ix_6", x0 = "_axis_141ix_21", C0 = "_axisX_141ix_32", L0 = "_axisY_141ix_37", z0 = "_qlab_141ix_44", M0 = "_tl_141ix_60", D0 = "_tr_141ix_64", I0 = "_bl_141ix_1", j0 = "_br_141ix_73", E0 = "_point_141ix_79", B0 = "_prioritized_141ix_111", A0 = "_selected_141ix_118", S0 = "_legend_141ix_128", R0 = "_ramp_141ix_140", de = {
  block: $0,
  canvas: w0,
  axis: x0,
  axisX: C0,
  axisY: L0,
  qlab: z0,
  tl: M0,
  tr: D0,
  bl: I0,
  br: j0,
  point: E0,
  prioritized: B0,
  selected: A0,
  legend: S0,
  ramp: R0
};
function s6({
  points: n,
  xLabel: t = "Esforço →",
  yLabel: s = "Impacto →",
  quadrants: a,
  legend: o = ["Prioridade alta", "Prioridade baixa"],
  selectedId: c,
  defaultSelectedId: i = null,
  onPointClick: _,
  className: f
}) {
  const [l, d] = S(i), u = c !== void 0 ? c : l;
  function m(p) {
    const h = u === p.id ? null : p.id;
    c === void 0 && d(h), _ == null || _(h ? p : null);
  }
  const b = (p) => {
    const h = n.length <= 1 ? 0 : p / (n.length - 1);
    return `color-mix(in oklab, var(--critical, #dc2626) ${Math.round((1 - h) * 100)}%, var(--info, #0a66c4))`;
  };
  return /* @__PURE__ */ r("div", { className: g(de.block, f), children: [
    /* @__PURE__ */ r("div", { className: de.canvas, role: "img", "aria-label": `Matriz ${s} por ${t}: ${n.length} itens`, children: [
      /* @__PURE__ */ e("span", { className: g(de.axis, de.axisX), "aria-hidden": "true", children: t }),
      /* @__PURE__ */ e("span", { className: g(de.axis, de.axisY), "aria-hidden": "true", children: s }),
      (a == null ? void 0 : a.topLeft) && /* @__PURE__ */ e("div", { className: g(de.qlab, de.tl), children: a.topLeft }),
      (a == null ? void 0 : a.topRight) && /* @__PURE__ */ e("div", { className: g(de.qlab, de.tr), children: a.topRight }),
      (a == null ? void 0 : a.bottomLeft) && /* @__PURE__ */ e("div", { className: g(de.qlab, de.bl), children: a.bottomLeft }),
      (a == null ? void 0 : a.bottomRight) && /* @__PURE__ */ e("div", { className: g(de.qlab, de.br), children: a.bottomRight }),
      n.map((p, h) => /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: g(
            de.point,
            p.prioritized && de.prioritized,
            u === p.id && de.selected
          ),
          style: { left: `${p.x}%`, bottom: `${p.y}%`, "--priority-color": b(h) },
          title: `${h + 1} · ${p.label}`,
          "aria-label": `${h + 1}: ${p.label}`,
          "aria-pressed": u === p.id,
          onClick: () => m(p),
          children: h + 1
        },
        p.id
      ))
    ] }),
    /* @__PURE__ */ r("div", { className: de.legend, "aria-hidden": "true", children: [
      /* @__PURE__ */ e("span", { children: o[0] }),
      /* @__PURE__ */ e("span", { className: de.ramp }),
      /* @__PURE__ */ e("span", { children: o[1] })
    ] })
  ] });
}
const T0 = "_frame_ic8cz_1", q0 = "_title_ic8cz_9", O0 = "_donutFrame_ic8cz_17", W0 = "_chart_ic8cz_25", P0 = "_axis_ic8cz_33", F0 = "_tick_ic8cz_37", H0 = "_grid_ic8cz_41", Q0 = "_tickLabel_ic8cz_46", U0 = "_axisTitle_ic8cz_52", V0 = "_value_ic8cz_60", G0 = "_stroke_primary_ic8cz_68", K0 = "_stroke_info_ic8cz_71", X0 = "_stroke_warn_ic8cz_74", Z0 = "_stroke_critical_ic8cz_77", Y0 = "_fill_primary_ic8cz_80", J0 = "_fill_info_ic8cz_83", ef = "_fill_warn_ic8cz_86", tf = "_fill_critical_ic8cz_89", nf = "_fill_muted_ic8cz_92", af = "_bg_primary_ic8cz_95", sf = "_bg_info_ic8cz_98", rf = "_bg_warn_ic8cz_101", of = "_bg_critical_ic8cz_104", cf = "_bg_muted_ic8cz_107", lf = "_line_ic8cz_112", df = "_endpoint_ic8cz_118", _f = "_gradTop_ic8cz_122", uf = "_gradBottom_ic8cz_126", mf = "_legend_ic8cz_132", hf = "_legendColumn_ic8cz_142", pf = "_legendItem_ic8cz_147", ff = "_swatch_ic8cz_152", bf = "_legendLabel_ic8cz_158", gf = "_legendValue_ic8cz_162", vf = "_drawIn_ic8cz_169", yf = "_areaIn_ic8cz_180", kf = "_fadeIn_ic8cz_184", Nf = "_bar_ic8cz_194", $f = "_barRow_ic8cz_206", wf = "_lineChart_ic8cz_211", xf = "_stretch_ic8cz_214", Cf = "_tooltipLayer_ic8cz_217", Lf = "_guide_ic8cz_220", zf = "_hoverDot_ic8cz_225", Mf = "_tipBox_ic8cz_229", Df = "_tipValue_ic8cz_233", If = "_tipLabel_ic8cz_239", jf = "_donutTrackArc_ic8cz_249", Ef = "_donutSeg_ic8cz_252", Bf = "_donutSvg_ic8cz_258", Af = "_donutValue_ic8cz_261", Sf = "_donutCaption_ic8cz_268", q = {
  frame: T0,
  title: q0,
  donutFrame: O0,
  chart: W0,
  axis: P0,
  tick: F0,
  grid: H0,
  tickLabel: Q0,
  axisTitle: U0,
  value: V0,
  stroke_primary: G0,
  stroke_info: K0,
  stroke_warn: X0,
  stroke_critical: Z0,
  fill_primary: Y0,
  fill_info: J0,
  fill_warn: ef,
  fill_critical: tf,
  fill_muted: nf,
  bg_primary: af,
  bg_info: sf,
  bg_warn: rf,
  bg_critical: of,
  bg_muted: cf,
  line: lf,
  endpoint: df,
  gradTop: _f,
  gradBottom: uf,
  legend: mf,
  legendColumn: hf,
  legendItem: pf,
  swatch: ff,
  legendLabel: bf,
  legendValue: gf,
  drawIn: vf,
  "chart-draw": "_chart-draw_ic8cz_1",
  areaIn: yf,
  "chart-fade": "_chart-fade_ic8cz_1",
  fadeIn: kf,
  bar: Nf,
  "bar-grow": "_bar-grow_ic8cz_1",
  barRow: $f,
  lineChart: wf,
  stretch: xf,
  tooltipLayer: Cf,
  guide: Lf,
  hoverDot: zf,
  tipBox: Mf,
  tipValue: Df,
  tipLabel: If,
  donutTrackArc: jf,
  donutSeg: Ef,
  donutSvg: Bf,
  donutValue: Af,
  donutCaption: Sf
}, Ke = 520, De = 260, ee = { left: 52, right: 16, top: 24, bottom: 44 };
function r6({
  title: n,
  data: t,
  series: s,
  xLabels: a,
  pointLabels: o,
  yTitle: c,
  xTitle: i,
  formatY: _,
  max: f,
  area: l = !0,
  showLegend: d,
  label: u,
  className: m
}) {
  const b = be().replace(/:/g, ""), p = Y(null), [h, v] = S(null), k = s ?? (t ? [{ name: u, data: t, tone: "primary" }] : []), y = bn(k, (M) => M.data.length) ?? 0, w = f ?? bn(k.flatMap((M) => M.data)) ?? 0, $ = tn().domain([0, y - 1]).range([ee.left, Ke - ee.right]), C = tn().domain([0, w]).nice(4).range([De - ee.bottom, ee.top]), N = Gn().x((M, F) => $(F)).y((M) => C(M)).curve(gn), x = ia().x((M, F) => $(F)).y0(De - ee.bottom).y1((M) => C(M)).curve(gn), j = C.ticks(4), E = _ ?? ((M) => Math.round(M).toLocaleString("pt-BR")), O = (M) => a && a.length > 1 ? M * (y - 1) / (a.length - 1) : M;
  function T(M) {
    const F = p.current.getBoundingClientRect(), V = (M.clientX - F.left) / F.width * Ke, W = Math.round($.invert(V));
    v(Math.max(0, Math.min(y - 1, W)));
  }
  const B = d ?? k.length > 1, L = 116, I = 18 + k.length * 14, z = h !== null ? Math.max(ee.left, Math.min(Ke - ee.right - L, $(h) + 10)) : 0;
  return /* @__PURE__ */ r("figure", { className: g(q.frame, m), children: [
    /* @__PURE__ */ e("h3", { className: q.title, children: n }),
    /* @__PURE__ */ r(
      "svg",
      {
        ref: p,
        viewBox: `0 0 ${Ke} ${De}`,
        role: "img",
        "aria-label": u,
        className: g(q.chart, q.stretch, q.lineChart),
        onPointerMove: T,
        onPointerLeave: () => v(null),
        children: [
          /* @__PURE__ */ e("defs", { children: /* @__PURE__ */ r("linearGradient", { id: b, x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ e("stop", { offset: "0%", className: q.gradTop }),
            /* @__PURE__ */ e("stop", { offset: "100%", className: q.gradBottom })
          ] }) }),
          /* @__PURE__ */ e("line", { className: q.axis, x1: ee.left, y1: ee.top - 6, x2: ee.left, y2: De - ee.bottom }),
          j.map((M) => /* @__PURE__ */ r("g", { children: [
            M > 0 && /* @__PURE__ */ e("line", { className: q.grid, x1: ee.left, y1: C(M), x2: Ke - ee.right, y2: C(M) }),
            /* @__PURE__ */ e("line", { className: q.tick, x1: ee.left - 4, y1: C(M), x2: ee.left, y2: C(M) }),
            /* @__PURE__ */ e("text", { className: q.tickLabel, x: ee.left - 8, y: C(M) + 3.5, textAnchor: "end", children: E(M) })
          ] }, M)),
          c && /* @__PURE__ */ e("text", { className: q.axisTitle, x: 6, y: ee.top - 10, children: c }),
          /* @__PURE__ */ e("line", { className: q.axis, x1: ee.left, y1: De - ee.bottom, x2: Ke - ee.right, y2: De - ee.bottom }),
          a == null ? void 0 : a.map((M, F) => {
            const V = $(O(F));
            return /* @__PURE__ */ r("g", { children: [
              /* @__PURE__ */ e("line", { className: q.tick, x1: V, y1: De - ee.bottom, x2: V, y2: De - ee.bottom + 4 }),
              /* @__PURE__ */ e("text", { className: q.tickLabel, x: V, y: De - ee.bottom + 16, textAnchor: "middle", children: M })
            ] }, `${M}-${F}`);
          }),
          i && /* @__PURE__ */ e("text", { className: q.axisTitle, x: (ee.left + Ke - ee.right) / 2, y: De - 6, textAnchor: "middle", children: i }),
          l && k.length === 1 && /* @__PURE__ */ e("path", { className: q.areaIn, d: x(k[0].data) ?? "", fill: `url(#${b})` }),
          k.map((M, F) => /* @__PURE__ */ r("g", { children: [
            /* @__PURE__ */ e(
              "path",
              {
                className: g(q.line, q[`stroke_${M.tone ?? "primary"}`], q.drawIn),
                style: { animationDelay: `${F * 120}ms` },
                pathLength: 1,
                d: N(M.data) ?? ""
              }
            ),
            /* @__PURE__ */ e(
              "circle",
              {
                className: g(q.endpoint, q[`fill_${M.tone ?? "primary"}`], q.fadeIn),
                cx: $(M.data.length - 1),
                cy: C(M.data[M.data.length - 1]),
                r: "4.5"
              }
            )
          ] }, M.name)),
          h !== null && /* @__PURE__ */ r("g", { className: q.tooltipLayer, children: [
            /* @__PURE__ */ e("line", { className: q.guide, x1: $(h), y1: ee.top, x2: $(h), y2: De - ee.bottom }),
            k.map((M) => /* @__PURE__ */ e(
              "circle",
              {
                className: g(q.hoverDot, q[`fill_${M.tone ?? "primary"}`]),
                cx: $(h),
                cy: C(M.data[h] ?? 0),
                r: "4.5"
              },
              M.name
            )),
            /* @__PURE__ */ r("g", { transform: `translate(${z}, ${ee.top + 4})`, children: [
              /* @__PURE__ */ e("rect", { className: q.tipBox, width: L, height: I, rx: "7" }),
              /* @__PURE__ */ e("text", { className: q.tipLabel, x: 10, y: 14, children: (o == null ? void 0 : o[h]) ?? (a == null ? void 0 : a[Math.round(h / Math.max(1, y - 1) * (((a == null ? void 0 : a.length) ?? 1) - 1))]) ?? `Ponto ${h + 1}` }),
              k.map((M, F) => /* @__PURE__ */ r("g", { transform: `translate(10, ${26 + F * 14})`, children: [
                /* @__PURE__ */ e("circle", { className: q[`fill_${M.tone ?? "primary"}`], cx: 3, cy: -3, r: "3" }),
                /* @__PURE__ */ e("text", { className: q.tipValue, x: 11, y: 0, children: E(M.data[h] ?? 0) })
              ] }, M.name))
            ] })
          ] })
        ]
      }
    ),
    B && /* @__PURE__ */ e("figcaption", { className: q.legend, children: k.map((M) => /* @__PURE__ */ r("span", { className: q.legendItem, children: [
      /* @__PURE__ */ e("span", { className: g(q.swatch, q[`bg_${M.tone ?? "primary"}`]) }),
      M.name
    ] }, M.name)) })
  ] });
}
function o6({ title: n, items: t, formatValue: s = (i) => String(i), valueTitle: a, label: o, className: c }) {
  const _ = De - ee.bottom, f = ee.top, l = (_ - f) / Math.max(1, t.length), d = Math.min(20, Math.max(10, l - 10)), u = Math.max(1, bn(t, (p) => p.value) ?? 0), m = tn().domain([0, u]).nice(4).range([0, Ke - 118 - 24]), b = m.ticks(4);
  return /* @__PURE__ */ r("figure", { className: g(q.frame, c), children: [
    /* @__PURE__ */ e("h3", { className: q.title, children: n }),
    /* @__PURE__ */ r("svg", { viewBox: `0 0 ${Ke} ${De}`, role: "img", "aria-label": o, className: g(q.chart, q.stretch), children: [
      b.map((p) => /* @__PURE__ */ r("g", { children: [
        /* @__PURE__ */ e("line", { className: q.grid, x1: 118 + m(p), y1: f, x2: 118 + m(p), y2: _ }),
        /* @__PURE__ */ e("line", { className: q.tick, x1: 118 + m(p), y1: _, x2: 118 + m(p), y2: _ + 4 }),
        /* @__PURE__ */ e("text", { className: q.tickLabel, x: 118 + m(p), y: _ + 16, textAnchor: "middle", children: s(p) })
      ] }, p)),
      /* @__PURE__ */ e("line", { className: q.axis, x1: 118, y1: f, x2: 118, y2: _ }),
      /* @__PURE__ */ e("line", { className: q.axis, x1: 118, y1: _, x2: Ke - 16, y2: _ }),
      t.map((p, h) => {
        const v = m(p.value), k = p.value === 0 ? 4 : v, y = f + h * l + (l - d) / 2, w = p.tone ?? "primary";
        return /* @__PURE__ */ r("g", { className: q.barRow, children: [
          /* @__PURE__ */ e("text", { className: q.tickLabel, x: 110, y: y + d / 2 + 3.5, textAnchor: "end", children: p.label }),
          /* @__PURE__ */ e(
            "rect",
            {
              className: g(q[`fill_${w}`], q.bar),
              style: { animationDelay: `${h * 70}ms` },
              x: 118,
              y,
              width: k,
              height: d,
              rx: "3",
              children: /* @__PURE__ */ e("title", { children: `${p.label}: ${s(p.value)}` })
            }
          ),
          /* @__PURE__ */ e(
            "text",
            {
              className: g(q.value, q.fadeIn),
              style: { animationDelay: `${h * 70 + 250}ms` },
              x: 118 + k + 8,
              y: y + d / 2 + 3.5,
              children: s(p.value)
            }
          )
        ] }, p.label);
      }),
      a && /* @__PURE__ */ e("text", { className: q.axisTitle, x: 118 + (Ke - 118 - 24) / 2, y: De - 6, textAnchor: "middle", children: a })
    ] })
  ] });
}
const Rf = 89, Tf = 67;
function c6({
  value: n,
  segments: t,
  centerLabel: s,
  caption: a,
  showLegend: o,
  formatValue: c = (l) => String(l),
  size: i = 220,
  label: _,
  className: f
}) {
  const l = Math.max(0, Math.min(100, n ?? 0)), [d, u] = S(0);
  J(() => {
    const y = requestAnimationFrame(() => u(l));
    return () => cancelAnimationFrame(y);
  }, [l]);
  const m = la().innerRadius(Tf).outerRadius(Rf).cornerRadius(6).startAngle((y) => y.start).endAngle((y) => y.end), b = 2 * Math.PI, p = m({ start: 0, end: b }) ?? "";
  let h = [];
  if (t) {
    const y = t.reduce(($, C) => $ + C.value, 0) || 1;
    let w = 0;
    h = t.map(($) => {
      const C = w / y * b;
      w += $.value;
      const N = w / y * b - 0.03;
      return { d: m({ start: C, end: Math.max(C, N) }) ?? "", tone: $.tone ?? "primary" };
    });
  } else
    h = [{ d: m({ start: 0, end: d / 100 * b }) ?? "", tone: "primary" }];
  const v = s ?? (t ? "" : `${l}%`), k = o ?? !!t;
  return /* @__PURE__ */ r("figure", { className: g(q.frame, q.donutFrame, f), children: [
    /* @__PURE__ */ r(
      "svg",
      {
        viewBox: "0 0 220 220",
        width: i,
        height: i,
        role: "img",
        "aria-label": t ? _ : `${_}: ${l}%`,
        className: g(q.chart, q.donutSvg),
        children: [
          /* @__PURE__ */ r("g", { transform: "translate(110 110)", children: [
            /* @__PURE__ */ e("path", { className: q.donutTrackArc, d: p }),
            h.map((y, w) => /* @__PURE__ */ e("path", { className: g(q.donutSeg, q[`fill_${y.tone}`]), d: y.d }, w))
          ] }),
          v && /* @__PURE__ */ e("text", { className: q.donutValue, x: "110", y: "108", textAnchor: "middle", children: v }),
          a && /* @__PURE__ */ e("text", { className: q.donutCaption, x: "110", y: "132", textAnchor: "middle", children: a })
        ]
      }
    ),
    k && t && /* @__PURE__ */ e("figcaption", { className: g(q.legend, q.legendColumn), children: t.map((y, w) => /* @__PURE__ */ r("span", { className: q.legendItem, children: [
      /* @__PURE__ */ e("span", { className: g(q.swatch, q[`bg_${y.tone ?? "primary"}`]) }),
      /* @__PURE__ */ e("span", { className: q.legendLabel, children: y.label }),
      /* @__PURE__ */ e("span", { className: q.legendValue, children: c(y.value) })
    ] }, y.label ?? w)) })
  ] });
}
function l6({ data: n, tone: t = "good", width: s = 100, height: a = 28, label: o, className: c }) {
  const i = tn().domain([0, n.length - 1]).range([1, s - 1]), _ = Math.min(...n), f = Math.max(...n), l = tn().domain([_, f === _ ? _ + 1 : f]).range([a - 4, 4]), d = Gn().x((u, m) => i(m)).y((u) => l(u)).curve(gn)(n) ?? "";
  return /* @__PURE__ */ e("svg", { width: s, height: a, role: "img", "aria-label": o, className: g(q.chart, c), children: /* @__PURE__ */ e("path", { className: g(q.line, q[t === "bad" ? "stroke_critical" : "stroke_primary"], q.drawIn), pathLength: 1, d }) });
}
const qf = "_wrap_19vyl_1", Of = "_item_19vyl_8", Wf = "_trigger_19vyl_9", Pf = "_title_19vyl_29", Ff = "_chevron_19vyl_30", Hf = "_itemOpen_19vyl_31", Qf = "_panel_19vyl_34", Uf = "_panelInner_19vyl_41", gt = {
  wrap: qf,
  item: Of,
  trigger: Wf,
  title: Pf,
  chevron: Ff,
  itemOpen: Hf,
  panel: Qf,
  panelInner: Uf
};
function i6({
  items: n,
  type: t = "single",
  value: s,
  defaultValue: a = [],
  onChange: o,
  className: c
}) {
  const [i, _] = S(a), f = s ?? i;
  function l(d) {
    const u = f.includes(d);
    let m;
    t === "single" ? m = u ? [] : [d] : m = u ? f.filter((b) => b !== d) : [...f, d], s === void 0 && _(m), o == null || o(m);
  }
  return /* @__PURE__ */ e("div", { className: g(gt.wrap, c), children: n.map((d) => {
    const u = f.includes(d.id);
    return /* @__PURE__ */ r("div", { className: g(gt.item, u && gt.itemOpen), children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: gt.trigger,
          "aria-expanded": u,
          disabled: d.disabled,
          onClick: () => l(d.id),
          children: [
            /* @__PURE__ */ e("span", { className: gt.title, children: d.title }),
            /* @__PURE__ */ e("svg", { className: gt.chevron, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "m6 9 6 6 6-6" }) })
          ]
        }
      ),
      /* @__PURE__ */ e("div", { className: gt.panel, role: "region", hidden: !u, children: /* @__PURE__ */ e("div", { className: gt.panelInner, children: d.content }) })
    ] }, d.id);
  }) });
}
const Vf = "_fab_6n00c_1", Gf = "_md_6n00c_19", Kf = "_lg_6n00c_20", Xf = "_icon_6n00c_21", Zf = "_extended_6n00c_26", Yf = "_label_6n00c_29", Jf = "_primary_6n00c_32", e4 = "_surface_6n00c_34", Wt = {
  fab: Vf,
  md: Gf,
  lg: Kf,
  icon: Xf,
  extended: Zf,
  label: Yf,
  primary: Jf,
  surface: e4
}, t4 = te(function({ icon: t, label: s, extended: a = !1, size: o = "lg", variant: c = "primary", className: i, ..._ }, f) {
  const l = a && !!s;
  return /* @__PURE__ */ r(
    "button",
    {
      ref: f,
      type: "button",
      "aria-label": l ? void 0 : s,
      className: g(
        Wt.fab,
        Wt[o],
        Wt[c],
        l && Wt.extended,
        i
      ),
      ..._,
      children: [
        /* @__PURE__ */ e("span", { className: Wt.icon, children: t }),
        l && /* @__PURE__ */ e("span", { className: Wt.label, children: s })
      ]
    }
  );
}), n4 = "_host_uuhv7_1", a4 = "_scrim_uuhv7_5", s4 = "_menuHost_uuhv7_13", r4 = "_trigger_uuhv7_18", o4 = "_triggerOpen_uuhv7_22", Jt = {
  host: n4,
  scrim: a4,
  menuHost: s4,
  trigger: r4,
  triggerOpen: o4
}, c4 = /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ e("path", { d: "M12 5v14M5 12h14" }) });
function d6({
  actions: n,
  label: t = "Abrir ações",
  open: s,
  defaultOpen: a = !1,
  onOpenChange: o,
  onSelect: c,
  align: i = "end",
  className: _
}) {
  const [f, l] = S(a), d = s !== void 0, u = d ? s : f;
  function m(p) {
    d || l(p), o == null || o(p);
  }
  const b = n.map((p) => ({
    type: "item",
    id: p.id,
    label: p.label,
    icon: p.icon,
    disabled: p.disabled,
    danger: p.danger,
    onSelect: p.onSelect
  }));
  return /* @__PURE__ */ r("div", { className: g(Jt.host, _), "data-open": u || void 0, children: [
    u && /* @__PURE__ */ e("div", { className: Jt.scrim, "aria-hidden": "true" }),
    /* @__PURE__ */ e(
      an,
      {
        open: u,
        onOpenChange: m,
        onSelect: c,
        entries: b,
        align: i,
        side: "top",
        className: Jt.menuHost,
        children: /* @__PURE__ */ e(
          t4,
          {
            icon: c4,
            label: u ? "Fechar ações" : t,
            "aria-expanded": u,
            "aria-haspopup": "menu",
            onClick: () => m(!u),
            className: g(Jt.trigger, u && Jt.triggerOpen)
          }
        )
      }
    )
  ] });
}
const l4 = "_card_18def_1", i4 = "_dashed_18def_29", d4 = "_current_18def_37", _4 = "_disabled_18def_42", u4 = "_title_18def_54", m4 = "_leading_18def_58", h4 = "_info_18def_71", p4 = "_description_18def_87", f4 = "_meta_18def_93", b4 = "_chevron_18def_102", nt = {
  card: l4,
  dashed: i4,
  current: d4,
  disabled: _4,
  title: u4,
  leading: m4,
  info: h4,
  description: p4,
  meta: f4,
  chevron: b4
}, g4 = /* @__PURE__ */ e(
  "svg",
  {
    className: nt.chevron,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    children: /* @__PURE__ */ e("path", { d: "m9 18 6-6-6-6" })
  }
), _6 = te(
  function({
    title: t,
    description: s,
    meta: a,
    leading: o,
    href: c,
    target: i,
    rel: _,
    onClick: f,
    disabled: l = !1,
    current: d = !1,
    variant: u = "solid",
    showChevron: m = !0,
    className: b
  }, p) {
    const h = g(
      nt.card,
      u === "dashed" && nt.dashed,
      d && nt.current,
      l && nt.disabled,
      b
    ), v = /* @__PURE__ */ r(He, { children: [
      o != null && /* @__PURE__ */ e("span", { className: nt.leading, children: o }),
      /* @__PURE__ */ r("span", { className: nt.info, children: [
        /* @__PURE__ */ e("span", { className: nt.title, children: t }),
        s != null && /* @__PURE__ */ e("span", { className: nt.description, children: s })
      ] }),
      a != null && /* @__PURE__ */ e("span", { className: nt.meta, children: a }),
      m && g4
    ] });
    return c ? /* @__PURE__ */ e(
      "a",
      {
        ref: p,
        className: h,
        href: l ? void 0 : c,
        target: i,
        rel: _,
        "aria-disabled": l || void 0,
        "aria-current": d ? "page" : void 0,
        tabIndex: l ? -1 : void 0,
        onClick: (k) => {
          if (l) {
            k.preventDefault();
            return;
          }
          f == null || f(k);
        },
        children: v
      }
    ) : /* @__PURE__ */ e(
      "button",
      {
        ref: p,
        type: "button",
        className: h,
        disabled: l,
        "aria-current": d ? "true" : void 0,
        onClick: f,
        children: v
      }
    );
  }
), v4 = "_toc_1c5y9_1", y4 = "_sticky_1c5y9_5", k4 = "_label_1c5y9_13", N4 = "_list_1c5y9_23", $4 = "_item_1c5y9_30", w4 = "_active_1c5y9_52", x4 = "_l2_1c5y9_58", C4 = "_l3_1c5y9_61", vt = {
  toc: v4,
  sticky: y4,
  label: k4,
  list: N4,
  item: $4,
  active: w4,
  l2: x4,
  l3: C4
};
function u6({
  items: n,
  label: t = "Nesta página",
  activeId: s,
  defaultActiveId: a,
  onActiveChange: o,
  scrollSpy: c = !0,
  rootMargin: i = "-80px 0px -60% 0px",
  root: _ = null,
  sticky: f = !1,
  className: l
}) {
  var k;
  const [d, u] = S(
    a ?? ((k = n[0]) == null ? void 0 : k.id)
  ), m = s !== void 0, b = m ? s : d, p = Y(o);
  p.current = o;
  const h = n.map((y) => y.id).join(",");
  J(() => {
    if (m || !c || typeof IntersectionObserver > "u") return;
    const y = h.split(",").map(($) => document.getElementById($)).filter(($) => $ != null);
    if (!y.length) return;
    const w = new IntersectionObserver(
      ($) => {
        const C = $.filter((N) => N.isIntersecting && N.intersectionRect.height > 0).sort((N, x) => N.boundingClientRect.top - x.boundingClientRect.top);
        if (C.length) {
          const N = C[0].target.id;
          u((x) => {
            var j;
            return x !== N && ((j = p.current) == null || j.call(p, N)), N;
          });
        }
      },
      { root: _, rootMargin: i, threshold: 0 }
    );
    return y.forEach(($) => w.observe($)), () => w.disconnect();
  }, [h, m, c, i, _]);
  function v(y, w) {
    const $ = document.getElementById(w.id);
    if (!$) return;
    y.preventDefault();
    const C = typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $.scrollIntoView({ behavior: C ? "auto" : "smooth", block: "start" }), m || u(w.id), o == null || o(w.id);
  }
  return /* @__PURE__ */ r("nav", { className: g(vt.toc, f && vt.sticky, l), "aria-label": t, children: [
    /* @__PURE__ */ e("div", { className: vt.label, "aria-hidden": "true", children: t }),
    /* @__PURE__ */ e("ul", { className: vt.list, children: n.map((y) => {
      const w = y.id === b;
      return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ e(
        "a",
        {
          href: `#${y.id}`,
          className: g(
            vt.item,
            y.level === 2 && vt.l2,
            y.level === 3 && vt.l3,
            w && vt.active
          ),
          "aria-current": w ? "location" : void 0,
          onClick: ($) => v($, y),
          children: y.label
        }
      ) }, y.id);
    }) })
  ] });
}
const L4 = "_subnav_k9nr5_1", z4 = "_group_k9nr5_6", M4 = "_groupTitle_k9nr5_9", D4 = "_list_k9nr5_22", I4 = "_item_k9nr5_31", j4 = "_icon_k9nr5_51", E4 = "_active_k9nr5_61", B4 = "_text_k9nr5_89", A4 = "_itemLabel_k9nr5_94", S4 = "_itemDesc_k9nr5_97", tt = {
  subnav: L4,
  group: z4,
  groupTitle: M4,
  list: D4,
  item: I4,
  icon: j4,
  active: E4,
  text: B4,
  itemLabel: A4,
  itemDesc: S4
};
function m6({
  items: n,
  groups: t,
  activeHref: s,
  label: a = "Configurações",
  renderLink: o,
  onNavigate: c,
  className: i
}) {
  const _ = t ?? (n ? [{ items: n }] : []);
  function f(l) {
    const d = l.href === s, u = {
      href: l.href,
      className: g(tt.item, d && tt.active),
      "aria-current": d ? "page" : void 0,
      onClick: c ? () => c(l) : void 0,
      children: /* @__PURE__ */ r(He, { children: [
        l.icon != null && /* @__PURE__ */ e("span", { className: tt.icon, "aria-hidden": "true", children: l.icon }),
        /* @__PURE__ */ r("span", { className: tt.text, children: [
          /* @__PURE__ */ e("span", { className: tt.itemLabel, children: l.label }),
          l.description != null && /* @__PURE__ */ e("span", { className: tt.itemDesc, children: l.description })
        ] })
      ] })
    };
    return /* @__PURE__ */ e("li", { children: o ? o(l, u) : /* @__PURE__ */ e("a", { ...u }) }, l.href);
  }
  return /* @__PURE__ */ e("nav", { className: g(tt.subnav, i), "aria-label": a, children: _.map((l, d) => /* @__PURE__ */ r("div", { className: tt.group, children: [
    l.title != null && /* @__PURE__ */ e("div", { className: tt.groupTitle, children: l.title }),
    /* @__PURE__ */ e("ul", { className: tt.list, children: l.items.map(f) })
  ] }, l.title ?? d)) });
}
const R4 = "_footer_1ncb0_1", T4 = "_sticky_1ncb0_14", q4 = "_fixed_1ncb0_18", O4 = "_start_1ncb0_25", W4 = "_end_1ncb0_34", en = {
  footer: R4,
  sticky: T4,
  fixed: q4,
  start: O4,
  end: W4
}, h6 = te(
  function({ start: t, children: s, position: a = "sticky", className: o, ...c }, i) {
    const _ = Y(null), [f, l] = S(0), d = Ft(
      (u) => {
        _.current = u, typeof i == "function" ? i(u) : i && (i.current = u);
      },
      [i]
    );
    return J(() => {
      if (a !== "fixed") return;
      const u = _.current;
      if (!u || typeof ResizeObserver > "u") return;
      const m = () => l(u.offsetHeight);
      m();
      const b = new ResizeObserver(m);
      return b.observe(u), () => b.disconnect();
    }, [a]), /* @__PURE__ */ r(He, { children: [
      a === "fixed" && /* @__PURE__ */ e("div", { "aria-hidden": "true", style: { height: f } }),
      /* @__PURE__ */ r(
        "div",
        {
          ref: d,
          className: g(
            en.footer,
            a === "fixed" ? en.fixed : en.sticky,
            o
          ),
          ...c,
          children: [
            t != null && /* @__PURE__ */ e("div", { className: en.start, children: t }),
            /* @__PURE__ */ e("div", { className: en.end, children: s })
          ]
        }
      )
    ] });
  }
), P4 = "_bar_c0p8d_1", F4 = "_visible_c0p8d_19", H4 = "_hidden_c0p8d_24", Q4 = "_context_c0p8d_30", U4 = "_title_c0p8d_37", V4 = "_meta_c0p8d_46", G4 = "_end_c0p8d_53", K4 = "_actions_c0p8d_54", yt = {
  bar: P4,
  visible: F4,
  hidden: H4,
  context: Q4,
  title: U4,
  meta: V4,
  end: G4,
  actions: K4
}, p6 = te(function({ title: t, meta: s, status: a, actions: o, visible: c = !0, className: i, ..._ }, f) {
  return /* @__PURE__ */ r(
    "header",
    {
      ref: f,
      className: g(yt.bar, c ? yt.visible : yt.hidden, i),
      "aria-hidden": c ? void 0 : !0,
      ..._,
      children: [
        /* @__PURE__ */ r("div", { className: yt.context, children: [
          /* @__PURE__ */ e("strong", { className: yt.title, children: t }),
          s != null && /* @__PURE__ */ e("span", { className: yt.meta, children: s })
        ] }),
        /* @__PURE__ */ r("div", { className: yt.end, children: [
          a,
          c && o != null && /* @__PURE__ */ e("div", { className: yt.actions, children: o })
        ] })
      ]
    }
  );
}), X4 = "_root_pq80p_1", Z4 = "_queue_pq80p_10", Y4 = "_summary_pq80p_15", J4 = "_items_pq80p_39", eb = "_item_pq80p_39", tb = "_active_pq80p_64", nb = "_mark_pq80p_74", ab = "_markComplete_pq80p_88", sb = "_markAttention_pq80p_94", rb = "_itemBody_pq80p_100", ob = "_editor_pq80p_122", Ge = {
  root: X4,
  queue: Z4,
  summary: Y4,
  items: J4,
  item: eb,
  active: tb,
  mark: nb,
  markComplete: ab,
  markAttention: sb,
  itemBody: rb,
  editor: ob
}, cb = {
  "not-started": "Não iniciado",
  "in-progress": "Em análise",
  attention: "Com pendência",
  complete: "Concluído"
};
function f6({
  label: n = "Itens da análise",
  items: t,
  activeId: s,
  onActiveChange: a,
  children: o,
  className: c,
  ...i
}) {
  const _ = t.filter((l) => l.state === "complete").length, f = t.length === 0 ? 0 : _ / t.length * 100;
  return /* @__PURE__ */ r("section", { className: g(Ge.root, c), ...i, children: [
    /* @__PURE__ */ r("aside", { className: Ge.queue, children: [
      /* @__PURE__ */ r("div", { className: Ge.summary, children: [
        /* @__PURE__ */ r("div", { children: [
          /* @__PURE__ */ e("strong", { children: n }),
          /* @__PURE__ */ r("span", { children: [
            _,
            " de ",
            t.length,
            " concluídos"
          ] })
        ] }),
        /* @__PURE__ */ e(
          jt,
          {
            value: f,
            tone: _ === t.length && t.length > 0 ? "neutral" : "primary",
            size: "sm",
            "aria-label": `Andamento da análise: ${_} de ${t.length} itens concluídos`
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: Ge.items, "aria-label": n, children: t.map((l, d) => {
        const u = l.id === s, m = l.state === "complete", b = l.state === "attention";
        return /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: g(Ge.item, u && Ge.active),
            "aria-current": u ? "step" : void 0,
            onClick: () => a(l.id),
            children: [
              /* @__PURE__ */ e("span", { className: g(Ge.mark, m && Ge.markComplete, b && Ge.markAttention), "aria-hidden": "true", children: m ? "✓" : b ? "!" : d + 1 }),
              /* @__PURE__ */ r("span", { className: Ge.itemBody, children: [
                /* @__PURE__ */ e("strong", { children: l.label }),
                l.meta != null && /* @__PURE__ */ e("small", { children: l.meta })
              ] }),
              /* @__PURE__ */ e(
                Xe,
                {
                  tone: m ? "success" : b ? "warn" : l.state === "in-progress" ? "info" : "neutral",
                  children: cb[l.state]
                }
              )
            ]
          },
          l.id
        );
      }) })
    ] }),
    /* @__PURE__ */ e("div", { className: Ge.editor, children: o })
  ] });
}
const lb = "_billing_1fca8_1", ib = "_methodRow_1fca8_8", db = "_brand_1fca8_13", _b = "_methodInfo_1fca8_34", ub = "_methodName_1fca8_38", mb = "_lastDigits_1fca8_44", hb = "_methodMeta_1fca8_47", pb = "_status_1fca8_53", fb = "_footer_1fca8_58", bb = "_nextCharge_1fca8_67", gb = "_nextChargeLabel_1fca8_70", vb = "_nextChargeValue_1fca8_79", yb = "_nextChargeDate_1fca8_87", kb = "_actions_1fca8_94", Le = {
  billing: lb,
  methodRow: ib,
  brand: db,
  methodInfo: _b,
  methodName: ub,
  lastDigits: mb,
  methodMeta: hb,
  status: pb,
  footer: fb,
  nextCharge: bb,
  nextChargeLabel: gb,
  nextChargeValue: vb,
  nextChargeDate: yb,
  actions: kb
};
function b6({
  brandIcon: n,
  methodLabel: t,
  lastDigits: s,
  methodMeta: a,
  status: o,
  nextChargeLabel: c = "Próxima cobrança",
  nextChargeAmount: i,
  nextChargeDate: _,
  actions: f,
  elevation: l = 0,
  className: d,
  ...u
}) {
  const m = i != null || f != null;
  return /* @__PURE__ */ r(Xn, { elevation: l, className: g(Le.billing, d), ...u, children: [
    /* @__PURE__ */ r("div", { className: Le.methodRow, children: [
      n && /* @__PURE__ */ e("span", { className: Le.brand, "aria-hidden": "true", children: n }),
      /* @__PURE__ */ r("div", { className: Le.methodInfo, children: [
        /* @__PURE__ */ r("div", { className: Le.methodName, children: [
          t,
          s && /* @__PURE__ */ r("span", { className: Le.lastDigits, children: [
            " · final ",
            s
          ] })
        ] }),
        a && /* @__PURE__ */ e("div", { className: Le.methodMeta, children: a })
      ] }),
      o && /* @__PURE__ */ e("div", { className: Le.status, children: o })
    ] }),
    m && /* @__PURE__ */ r("div", { className: Le.footer, children: [
      i != null && /* @__PURE__ */ r("div", { className: Le.nextCharge, children: [
        /* @__PURE__ */ e("div", { className: Le.nextChargeLabel, children: c }),
        /* @__PURE__ */ r("div", { className: Le.nextChargeValue, children: [
          i,
          _ && /* @__PURE__ */ r("span", { className: Le.nextChargeDate, children: [
            " ",
            _
          ] })
        ] })
      ] }),
      f && /* @__PURE__ */ e("div", { className: Le.actions, children: f })
    ] })
  ] });
}
const Nb = "_plan_1mhe0_1", $b = "_current_1mhe0_14", wb = "_highlighted_1mhe0_17", xb = "_tag_1mhe0_28", Cb = "_tagNeutral_1mhe0_43", Lb = "_name_1mhe0_50", zb = "_priceRow_1mhe0_58", Mb = "_price_1mhe0_58", Db = "_period_1mhe0_72", Ib = "_priceNote_1mhe0_76", jb = "_cta_1mhe0_84", Eb = "_features_1mhe0_92", Bb = "_feature_1mhe0_92", Ab = "_check_1mhe0_108", Sb = "_featureText_1mhe0_119", $e = {
  plan: Nb,
  current: $b,
  highlighted: wb,
  tag: xb,
  tagNeutral: Cb,
  name: Lb,
  priceRow: zb,
  price: Mb,
  period: Db,
  priceNote: Ib,
  cta: jb,
  features: Eb,
  feature: Bb,
  check: Ab,
  featureText: Sb
}, Rb = /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "m5 12 5 5L20 7" }) });
function g6({
  name: n,
  price: t,
  period: s,
  priceNote: a,
  features: o,
  checkIcon: c,
  cta: i,
  current: _ = !1,
  currentLabel: f = "Plano atual",
  highlighted: l = !1,
  highlightLabel: d = "Recomendado",
  className: u,
  ...m
}) {
  const b = _ ? f : l ? d : null;
  return /* @__PURE__ */ r(
    "div",
    {
      className: g(
        $e.plan,
        _ && $e.current,
        l && $e.highlighted,
        u
      ),
      ...m,
      children: [
        b && /* @__PURE__ */ e("span", { className: g($e.tag, _ && !l && $e.tagNeutral), children: b }),
        /* @__PURE__ */ e("h3", { className: $e.name, children: n }),
        /* @__PURE__ */ r("div", { className: $e.priceRow, children: [
          /* @__PURE__ */ e("span", { className: $e.price, children: t }),
          s && /* @__PURE__ */ e("span", { className: $e.period, children: s })
        ] }),
        /* @__PURE__ */ e("div", { className: $e.priceNote, children: a }),
        /* @__PURE__ */ e("div", { className: $e.cta, children: _ ? /* @__PURE__ */ e(oe, { variant: "secondary", block: !0, disabled: !0, children: f }) : i }),
        o && o.length > 0 && /* @__PURE__ */ e("ul", { className: $e.features, children: o.map((p, h) => /* @__PURE__ */ r("li", { className: $e.feature, children: [
          /* @__PURE__ */ e("span", { className: $e.check, "aria-hidden": "true", children: c ?? Rb }),
          /* @__PURE__ */ e("span", { className: $e.featureText, children: p })
        ] }, h)) })
      ]
    }
  );
}
const Tb = "_meter_1dm2t_1", qb = "_head_1dm2t_8", Ob = "_label_1dm2t_14", Wb = "_value_1dm2t_21", Pb = "_used_1dm2t_29", Fb = "_limit_1dm2t_38", Hb = "_unit_1dm2t_42", Qb = "_meta_1dm2t_47", Ub = "_group_1dm2t_54", at = {
  meter: Tb,
  head: qb,
  label: Ob,
  value: Wb,
  used: Pb,
  "value-warn": "_value-warn_1dm2t_32",
  "value-critical": "_value-critical_1dm2t_35",
  limit: Fb,
  unit: Hb,
  meta: Qb,
  group: Ub
}, Vb = new Intl.NumberFormat("pt-BR"), Gb = (n) => Vb.format(n);
function Kb(n, t = 80, s = 100) {
  return n >= s ? "critical" : n >= t ? "warn" : "primary";
}
function v6({
  label: n,
  used: t,
  limit: s,
  unit: a,
  meta: o,
  formatValue: c = Gb,
  warnAt: i = 80,
  criticalAt: _ = 100,
  size: f = "md",
  className: l,
  ...d
}) {
  const u = s > 0 ? t / s * 100 : 0, m = Kb(u, i, _), b = c(t), p = c(s);
  return /* @__PURE__ */ r("div", { className: g(at.meter, l), ...d, children: [
    /* @__PURE__ */ r("div", { className: at.head, children: [
      /* @__PURE__ */ e("span", { className: at.label, children: n }),
      /* @__PURE__ */ r("span", { className: g(at.value, at[`value-${m}`]), children: [
        /* @__PURE__ */ e("span", { className: at.used, children: b }),
        /* @__PURE__ */ r("span", { className: at.limit, children: [
          " / ",
          p
        ] }),
        a && /* @__PURE__ */ r("span", { className: at.unit, children: [
          " ",
          a
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e(
      jt,
      {
        value: u,
        tone: m,
        size: f,
        "aria-label": typeof n == "string" ? n : void 0,
        "aria-valuetext": `${b} de ${p}${typeof a == "string" ? ` ${a}` : ""}`
      }
    ),
    o && /* @__PURE__ */ e("div", { className: at.meta, children: o })
  ] });
}
function y6({ children: n, className: t, ...s }) {
  return /* @__PURE__ */ e("div", { role: "list", className: g(at.group, t), ...s, children: n });
}
const Xb = "_block_1td89_1", Zb = "_head_1td89_8", Yb = "_headInfo_1td89_16", Jb = "_label_1td89_22", eg = "_language_1td89_31", tg = "_body_1td89_41", ng = "_pre_1td89_44", ag = "_code_1td89_53", sg = "_overlay_1td89_62", rg = "_actions_1td89_69", og = "_copied_1td89_75", cg = "_action_1td89_69", lg = "_actionCopied_1td89_94", ze = {
  block: Xb,
  head: Zb,
  headInfo: Yb,
  label: Jb,
  language: eg,
  body: tg,
  pre: ng,
  code: ag,
  overlay: sg,
  actions: rg,
  copied: og,
  action: cg,
  actionCopied: lg
}, ig = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ e("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2" }),
  /* @__PURE__ */ e("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
] }), dg = /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "m5 12 5 5L20 7" }) }), _g = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ e("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" }),
  /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "3" })
] }), ug = /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ e("path", { d: "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }),
  /* @__PURE__ */ e("path", { d: "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }),
  /* @__PURE__ */ e("path", { d: "M14.12 14.12a3 3 0 1 1-4.24-4.24" }),
  /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "22", y2: "22" })
] });
function mg(n, t) {
  const s = "•".repeat(16);
  return t <= 0 || n.length <= t ? s : s + n.slice(-t);
}
async function hg(n) {
  var s;
  if ((s = navigator.clipboard) != null && s.writeText)
    try {
      await navigator.clipboard.writeText(n);
      return;
    } catch {
    }
  const t = document.createElement("textarea");
  t.value = n, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.appendChild(t), t.select(), document.execCommand("copy"), document.body.removeChild(t);
}
function k6({
  code: n,
  children: t,
  label: s,
  language: a,
  secret: o = !1,
  visibleChars: c = 4,
  copyLabel: i = "Copiar código",
  copiedLabel: _ = "Copiado",
  revealLabel: f = "Revelar valor",
  hideLabel: l = "Ocultar valor",
  onCopy: d,
  className: u,
  ...m
}) {
  const [b, p] = S(!1), [h, v] = S(!1), k = Y(void 0);
  J(() => () => window.clearTimeout(k.current), []);
  const y = async () => {
    await hg(n), d == null || d(n), p(!0), window.clearTimeout(k.current), k.current = window.setTimeout(() => p(!1), 2e3);
  }, $ = o && !h ? mg(n, c) : t ?? n, C = s != null || a != null || o, N = /* @__PURE__ */ r("div", { className: ze.actions, children: [
    /* @__PURE__ */ e("span", { className: ze.copied, role: "status", "aria-live": "polite", children: b ? _ : "" }),
    o && /* @__PURE__ */ e(
      ge,
      {
        className: ze.action,
        size: "sm",
        icon: h ? ug : _g,
        "aria-label": h ? l : f,
        "aria-pressed": h,
        onClick: () => v((x) => !x)
      }
    ),
    /* @__PURE__ */ e(
      ge,
      {
        className: g(ze.action, b && ze.actionCopied),
        size: "sm",
        icon: b ? dg : ig,
        "aria-label": i,
        onClick: y
      }
    )
  ] });
  return /* @__PURE__ */ r("div", { className: g(ze.block, u), ...m, children: [
    C && /* @__PURE__ */ r("div", { className: ze.head, children: [
      /* @__PURE__ */ r("span", { className: ze.headInfo, children: [
        s && /* @__PURE__ */ e("span", { className: ze.label, children: s }),
        a && /* @__PURE__ */ e("span", { className: ze.language, children: a })
      ] }),
      N
    ] }),
    /* @__PURE__ */ r("div", { className: ze.body, children: [
      /* @__PURE__ */ e(
        "pre",
        {
          className: ze.pre,
          tabIndex: 0,
          "aria-label": typeof s == "string" ? s : a,
          children: /* @__PURE__ */ e("code", { className: ze.code, children: $ })
        }
      ),
      !C && /* @__PURE__ */ e("div", { className: ze.overlay, children: N })
    ] })
  ] });
}
const pg = "_header_1boqj_1", fg = "_breadcrumb_1boqj_6", bg = "_row_1boqj_10", gg = "_text_1boqj_18", vg = "_eyebrow_1boqj_22", yg = "_title_1boqj_35", kg = "_lead_1boqj_45", Ng = "_actions_1boqj_53", kt = {
  header: pg,
  breadcrumb: fg,
  row: bg,
  text: gg,
  eyebrow: vg,
  title: yg,
  lead: kg,
  actions: Ng
}, N6 = te(
  function({ eyebrow: t, title: s, lead: a, actions: o, breadcrumb: c, className: i, ..._ }, f) {
    return /* @__PURE__ */ r("header", { ref: f, className: g(kt.header, i), ..._, children: [
      c != null && /* @__PURE__ */ e("div", { className: kt.breadcrumb, children: c }),
      /* @__PURE__ */ r("div", { className: kt.row, children: [
        /* @__PURE__ */ r("div", { className: kt.text, children: [
          t != null && /* @__PURE__ */ e("p", { className: kt.eyebrow, children: t }),
          /* @__PURE__ */ e("h1", { className: kt.title, children: s }),
          a != null && /* @__PURE__ */ e("p", { className: kt.lead, children: a })
        ] }),
        o != null && /* @__PURE__ */ e("div", { className: kt.actions, children: o })
      ] })
    ] });
  }
), $g = "_header_172ly_1", wg = "_row_172ly_7", xg = "_title_172ly_13", Cg = "_count_172ly_25", Lg = "_action_172ly_29", zg = "_sub_172ly_38", Mg = "_rule_172ly_47", Dg = "_ruleLine_172ly_54", Nt = {
  header: $g,
  row: wg,
  title: xg,
  count: Cg,
  action: Lg,
  sub: zg,
  rule: Mg,
  ruleLine: Dg
}, $6 = te(
  function({ title: t, sub: s, count: a, action: o, id: c, rule: i = !1, className: _, ...f }, l) {
    return /* @__PURE__ */ r(
      "header",
      {
        ref: l,
        id: c,
        className: g(Nt.header, i && Nt.rule, _),
        ...f,
        children: [
          /* @__PURE__ */ r("div", { className: Nt.row, children: [
            /* @__PURE__ */ r("h2", { className: Nt.title, children: [
              t,
              a != null && /* @__PURE__ */ e(Xe, { tone: "neutral", className: Nt.count, children: a })
            ] }),
            i && /* @__PURE__ */ e("span", { className: Nt.ruleLine, "aria-hidden": "true" }),
            o != null && /* @__PURE__ */ e("span", { className: Nt.action, children: o })
          ] }),
          s != null && /* @__PURE__ */ e("p", { className: Nt.sub, children: s })
        ]
      }
    );
  }
), Ig = "_cell_4jfug_1", jg = "_md_4jfug_8", Eg = "_avatar_4jfug_12", Bg = "_info_4jfug_17", Ag = "_name_4jfug_24", Sg = "_sm_4jfug_35", Rg = "_tag_4jfug_42", Tg = "_secondary_4jfug_53", Dt = {
  cell: Ig,
  md: jg,
  avatar: Eg,
  info: Bg,
  name: Ag,
  sm: Sg,
  tag: Rg,
  secondary: Tg
};
function w6({
  avatar: n,
  name: t,
  tag: s,
  secondary: a,
  size: o = "md",
  className: c,
  ...i
}) {
  return /* @__PURE__ */ r("div", { className: g(Dt.cell, Dt[o], c), ...i, children: [
    n != null && /* @__PURE__ */ e("span", { className: Dt.avatar, children: n }),
    /* @__PURE__ */ r("span", { className: Dt.info, children: [
      /* @__PURE__ */ r("span", { className: Dt.name, children: [
        t,
        s != null && /* @__PURE__ */ e("span", { className: Dt.tag, children: s })
      ] }),
      a != null && /* @__PURE__ */ e("span", { className: Dt.secondary, children: a })
    ] })
  ] });
}
const qg = "_zone_519ix_1", Og = "_title_519ix_13", Wg = "_rows_519ix_23", Pg = "_row_519ix_23", Fg = "_body_519ix_44", Hg = "_rowTitle_519ix_49", Qg = "_rowDesc_519ix_57", It = {
  zone: qg,
  title: Og,
  rows: Wg,
  row: Pg,
  body: Fg,
  rowTitle: Hg,
  rowDesc: Qg
};
function x6({ title: n, className: t, children: s, ...a }) {
  return /* @__PURE__ */ r("div", { role: "group", className: g(It.zone, t), ...a, children: [
    n != null && /* @__PURE__ */ e("h3", { className: It.title, children: n }),
    /* @__PURE__ */ e("div", { className: It.rows, children: s })
  ] });
}
function C6({
  title: n,
  description: t,
  actionLabel: s,
  onConfirm: a,
  disabled: o = !1,
  className: c,
  ...i
}) {
  return /* @__PURE__ */ r("div", { className: g(It.row, c), ...i, children: [
    /* @__PURE__ */ r("div", { className: It.body, children: [
      /* @__PURE__ */ e("div", { className: It.rowTitle, children: n }),
      t != null && /* @__PURE__ */ e("div", { className: It.rowDesc, children: t })
    ] }),
    /* @__PURE__ */ e(oe, { variant: "danger", size: "sm", disabled: o, onClick: a, children: s })
  ] });
}
const Ug = "_card_1vc6o_1", Vg = "_locked_1vc6o_19", Gg = "_logo_1vc6o_26", Kg = "_body_1vc6o_44", Xg = "_name_1vc6o_49", Zg = "_status_1vc6o_59", Yg = "_description_1vc6o_64", Jg = "_meta_1vc6o_71", ev = "_actions_1vc6o_81", ut = {
  card: Ug,
  locked: Vg,
  logo: Gg,
  body: Kg,
  name: Xg,
  status: Zg,
  description: Yg,
  meta: Jg,
  actions: ev
};
function L6({
  logo: n,
  name: t,
  status: s,
  description: a,
  meta: o,
  actions: c,
  locked: i = !1,
  lockHint: _,
  className: f,
  ...l
}) {
  return /* @__PURE__ */ r("article", { className: g(ut.card, i && ut.locked, f), ...l, children: [
    n != null && /* @__PURE__ */ e("span", { className: ut.logo, children: n }),
    /* @__PURE__ */ r("div", { className: ut.body, children: [
      /* @__PURE__ */ r("div", { className: ut.name, children: [
        t,
        s != null && /* @__PURE__ */ e("span", { className: ut.status, children: s })
      ] }),
      a != null && /* @__PURE__ */ e("div", { className: ut.description, children: a }),
      o != null && /* @__PURE__ */ e("div", { className: ut.meta, children: o })
    ] }),
    (i ? _ : c) != null && /* @__PURE__ */ e("div", { className: ut.actions, children: i ? _ : c })
  ] });
}
const tv = "_stat_njegg_1", nv = "_label_njegg_8", av = "_valueRow_njegg_17", sv = "_value_njegg_17", rv = "_sm_njegg_33", ov = "_md_njegg_34", cv = "_lg_njegg_35", lv = "_unit_njegg_37", iv = "_delta_njegg_45", dv = "_deltaIcon_njegg_61", _v = "_description_njegg_67", uv = "_chart_njegg_73", mv = "_srOnly_njegg_78", hv = "_group_njegg_91", Oe = {
  stat: tv,
  label: nv,
  valueRow: av,
  value: sv,
  sm: rv,
  md: ov,
  lg: cv,
  unit: lv,
  delta: iv,
  "delta-positive": "_delta-positive_njegg_55",
  "delta-negative": "_delta-negative_njegg_58",
  "delta-neutral": "_delta-neutral_njegg_59",
  deltaIcon: dv,
  description: _v,
  chart: uv,
  srOnly: mv,
  group: hv
}, pv = {
  up: "M7 17 17 7M8 7h9v9",
  down: "M7 7l10 10M17 8v9H8"
}, z6 = te(function({ label: t, value: s, unit: a, description: o, delta: c, chart: i, size: _ = "md", className: f, ...l }, d) {
  const u = (c == null ? void 0 : c.sentiment) ?? ((c == null ? void 0 : c.trend) === "up" ? "positive" : "negative");
  return /* @__PURE__ */ r("div", { ref: d, className: g(Oe.stat, Oe[_], f), ...l, children: [
    /* @__PURE__ */ e("span", { className: Oe.label, children: t }),
    /* @__PURE__ */ r("span", { className: Oe.valueRow, children: [
      /* @__PURE__ */ r("span", { className: Oe.value, children: [
        s,
        a != null && /* @__PURE__ */ e("span", { className: Oe.unit, children: a })
      ] }),
      c && /* @__PURE__ */ r("span", { className: g(Oe.delta, Oe[`delta-${u}`]), children: [
        /* @__PURE__ */ e(
          "svg",
          {
            className: Oe.deltaIcon,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2.4",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": "true",
            children: /* @__PURE__ */ e("path", { d: pv[c.trend] })
          }
        ),
        c.value,
        /* @__PURE__ */ e("span", { className: Oe.srOnly, children: c.trend === "up" ? " (em alta)" : " (em queda)" })
      ] })
    ] }),
    o != null && /* @__PURE__ */ e("span", { className: Oe.description, children: o }),
    i != null && /* @__PURE__ */ e("span", { className: Oe.chart, children: i })
  ] });
}), M6 = te(function({ children: t, className: s, ...a }, o) {
  return /* @__PURE__ */ e("div", { ref: o, className: g(Oe.group, s), ...a, children: t });
}), fv = "_horizontal_4xost_2", bv = "_withLabel_4xost_9", gv = "_label_4xost_24", vv = "_vertical_4xost_35", Pt = {
  horizontal: fv,
  withLabel: bv,
  label: gv,
  vertical: vv,
  "spacing-none": "_spacing-none_4xost_43",
  "spacing-sm": "_spacing-sm_4xost_44",
  "spacing-md": "_spacing-md_4xost_45",
  "spacing-lg": "_spacing-lg_4xost_46"
}, D6 = te(function({ orientation: t = "horizontal", label: s, spacing: a = "md", className: o, ...c }, i) {
  const _ = t === "vertical", f = !_ && s != null;
  return /* @__PURE__ */ e(
    "div",
    {
      ref: i,
      role: "separator",
      "aria-orientation": _ ? "vertical" : void 0,
      className: g(
        Pt.divider,
        _ ? Pt.vertical : Pt.horizontal,
        f && Pt.withLabel,
        Pt[`spacing-${a}`],
        o
      ),
      ...c,
      children: f && /* @__PURE__ */ e("span", { className: Pt.label, children: s })
    }
  );
});
export {
  i6 as Accordion,
  Fv as AppShell,
  f6 as ApprovalWorkbench,
  Ze as Avatar,
  zv as AvatarGroup,
  Xe as Badge,
  o6 as BarChart,
  b6 as BillingCard,
  Kn as BrandLogo,
  Gu as Breadcrumb,
  oe as Button,
  Lv as ButtonGroup,
  ad as Calendar,
  xt as Callout,
  Xn as Card,
  Mv as CardHeader,
  Hv as Checkbox,
  yn as Chip,
  hd as ChoiceCard,
  md as ChoiceCardGroup,
  k6 as CodeBlock,
  Gv as Combobox,
  Yv as Command,
  L6 as ConnectorCard,
  x6 as DangerZone,
  C6 as DangerZoneRow,
  D6 as Divider,
  c6 as DonutChart,
  Jv as Drawer,
  na as EmptyState,
  Rv as EventTimeline,
  t4 as Fab,
  d6 as FabMenu,
  Tv as FileUpload,
  Bv as GeoAreaPicker,
  Cv as GoogleButton,
  jv as GuidedTour,
  Ev as GuidedTourAnchor,
  Kv as HelpField,
  a6 as HelpMenu,
  Sp as HoverCard,
  ge as IconButton,
  Y_ as Input,
  Iv as IntentComposer,
  Wv as KanbanBoard,
  nn as Kbd,
  r6 as LineChart,
  s6 as Matrix2x2,
  an as Menu,
  Uv as Modal,
  Zn as Multiselect,
  _6 as NavCard,
  n6 as NotificationBell,
  Zv as Otp,
  N6 as PageHeader,
  fh as Pagination,
  w6 as PersonCell,
  qv as PhoneInput,
  g6 as PlanCard,
  bc as Popover,
  Ov as PostalCodeInput,
  jt as ProgressBar,
  ta as PropertyActionGroup,
  vi as PropertyCard,
  Ml as PropertyMedia,
  Qv as RadioGroup,
  Oc as Range,
  Jl as ScoreGauge,
  $6 as SectionHeader,
  Yn as Segmented,
  Tm as Select,
  In as SettingRow,
  jn as SettingRowGroup,
  m6 as SettingsSubnav,
  qu as Sidebar,
  ea as Skeleton,
  Xv as Slider,
  t6 as Snackbar,
  l6 as Sparkline,
  Pv as SplitButton,
  z6 as Stat,
  M6 as StatGroup,
  On as StatusDot,
  p6 as StickyBar,
  h6 as StickyFooter,
  Av as SwipeDeck,
  gs as Switch,
  Vv as Table,
  u6 as TableOfContents,
  dm as Tabs,
  ec as Textarea,
  J2 as Toast,
  e6 as ToastRegion,
  yd as ToggleGroup,
  vn as Tooltip,
  $m as Topbar,
  v6 as UsageMeter,
  y6 as UsageMeterGroup,
  V1 as UserMenu,
  Sv as VisitSchedulePicker,
  lo as VoiceRecorder,
  Dv as WizardStepper,
  uu as WorkspaceSwitcher,
  g as cn,
  Ad as groupVisitTimes,
  W_ as phoneCountries,
  Zl as scoreBand,
  Kb as usageTone
};
//# sourceMappingURL=index.js.map
