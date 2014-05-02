(function($) {
  return $.fn.extend({
    kleur: function(opts) {
      var HSLToHex, HSLToRGB, RGBToHSL, RGBToHex, clamp, hexToHSL, hexToRGB, log, settings;
      settings = {
        initialColor: '#ff0000',
        changeCallback: null
      };
      settings = $.extend(settings, opts);
      log = function(msg) {
        return typeof console !== "undefined" && console !== null ? console.log(msg) : void 0;
      };
      HSLToRGB = function(h, s, l) {
        var b, g, hueToRGB, p, q, r;
        h /= 360;
        s /= 100;
        l /= 100;
        r = void 0;
        g = void 0;
        b = void 0;
        if (s === 0) {
          r = g = b = l;
        } else {
          hueToRGB = function(p, q, t) {
            if (t < 0) {
              t += 1;
            }
            if (t > 1) {
              t -= 1;
            }
            if (t < 1 / 6) {
              return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
              return q;
            }
            if (t < 2 / 3) {
              return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
          };
          q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
          p = 2 * l - q;
          r = hueToRGB(p, q, h + 1 / 3);
          g = hueToRGB(p, q, h);
          b = hueToRGB(p, q, h - 1 / 3);
        }
        return {
          red: Math.round(r * 255),
          green: Math.round(g * 255),
          blue: Math.round(b * 255)
        };
      };
      RGBToHSL = function(r, g, b) {
        var d, h, l, max, min, s;
        r /= 255;
        g /= 255;
        b /= 255;
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        h = void 0;
        s = void 0;
        l = (max + min) / 2;
        if (max === min) {
          h = s = 0;
        } else {
          d = max - min;
          s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
          }
          h /= 6;
        }
        return {
          hue: Math.round(h * 360),
          saturation: Math.round(s * 100),
          luminosity: Math.round(l * 100)
        };
      };
      RGBToHex = function(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      };
      hexToRGB = function(hex) {
        var b, bigInt, g, r;
        bigInt = parseInt(hex, 16);
        r = (bigInt >> 16) & 255;
        g = (bigInt >> 8) & 255;
        b = bigInt & 255;
        return {
          red: r,
          green: g,
          blue: b
        };
      };
      hexToHSL = function(hex) {
        var RGB;
        RGB = hexToRGB(hex);
        return RGBToHSL(RGB.red, RGB.green, RGB.blue);
      };
      HSLToHex = function(h, s, l) {
        var RGB;
        RGB = HSLToRGB(h, s, l);
        return RGBToHex(RGB.red, RGB.green, RGB.blue);
      };
      clamp = function(num, min, max) {
        if (num > max) {
          num = max;
        }
        if (num < min) {
          num = min;
        }
        return num;
      };
      return this.each(function() {
        var adjuster, color, getHSL, hex, hexField, hsl, hueInput, init, movePin, picker, pin, preview, rgb, setColorsForPinPosition, setPinPositionForColor, spectrum, updateColorPreview, updateGradientBox;
        picker = $(this);
        color = settings.initialColor.replace("#", "");
        adjuster = picker.find(".color-adjuster");
        hexField = picker.find(".kleur-hex");
        hueInput = picker.find(".kleur-hue");
        pin = picker.find(".kleur-spectrum-pin");
        preview = picker.find(".color-preview");
        spectrum = picker.find(".kleur-spectrum");
        init = function() {
          var hsl;
          hsl = hexToHSL(color);
          hexField.val(color);
          hueInput.val(hsl.hue);
          updateGradientBox(HSLToHex(hsl.hue, 100, 50));
          updateColorPreview(color);
          return setPinPositionForColor(hsl);
        };
        getHSL = function(h) {
          var hsl, hue, lightness, pinLeft, pinTop, saturation;
          pinTop = parseFloat(pin[0].style.top);
          pinLeft = parseFloat(pin[0].style.left);
          hue = parseInt(h, 10);
          if (hue === 360) {
            hue = 0;
          }
          lightness = (50 * (1 - (pinLeft / 100)) + 50) * (1 - (pinTop / 100));
          saturation = pinLeft;
          hue = Math.round(clamp(hue, 0, 360));
          saturation = Math.round(clamp(saturation, 0, 100));
          lightness = Math.round(clamp(lightness, 0, 100));
          hsl = {
            hue: hue,
            saturation: saturation,
            lightness: lightness
          };
          window.hsl = hsl;
          return hsl;
        };
        updateColorPreview = function(hex) {
          return preview.css({
            "background-color": "#" + hex
          });
        };
        updateGradientBox = function(hex) {
          return spectrum.children('.spectrum-bg').css({
            "background-color": "#" + hex
          });
        };
        setColorsForPinPosition = function() {
          var hex, hsl;
          hsl = getHSL(hueInput.val());
          hex = HSLToHex(hsl.hue, hsl.saturation, hsl.lightness);
          hexField.val(hex);
          updateColorPreview(hex);
        };
        setPinPositionForColor = function(hsl) {
          var lightness;
          lightness = (50 * (1 - (hsl.saturation / 100)) + 50) * (1 - (hsl.luminosity / 100));
          lightness = clamp(lightness, 0, 100);
          pin.css({
            left: hsl.saturation + "%",
            top: lightness + "%"
          });
        };
        movePin = function(event) {
          var height, offset, pinHeight, pinWidth, width, x, y;
          offset = spectrum.offset();
          width = spectrum.width();
          height = spectrum.height();
          pinWidth = pin.width();
          pinHeight = pin.height();
          x = event.clientX - offset.left;
          y = event.clientY - offset.top;
          if (x <= (-(pinWidth / 2))) {
            x = 0;
          } else {
            if (x >= width + (pinWidth / 2)) {
              x = width;
            }
          }
          if (y < (pinHeight / 2)) {
            y = 0;
          } else {
            if (y >= height + (pinHeight / 2)) {
              y = height;
            }
          }
          pin.css({
            left: x / width * 100 + "%",
            top: y / height * 100 + "%"
          });
          setColorsForPinPosition();
          picker.trigger("kleur.change");
        };

        /* Events */
        hexField.on("change", function() {
          var HSL, hex;
          HSL = {};
          hex = void 0;
          if (/([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g.test($(this).val())) {
            hex = $(this).val();
            HSL = hexToHSL(hex);
          } else {
            hex = color;
            $(this).val(hex);
            HSL = hexToHSL(hex);
          }
          setPinPositionForColor(HSL);
          hueInput.val(HSL.hue);
          updateGradientBox(HSLToHex(HSL.hue, 100, 50));
          updateColorPreview(hex);
          picker.trigger("kleur.change");
        });
        hexField.on("paste", function() {
          setTimeout(((function(_this) {
            return function() {
              return $(_this).val($(_this).val().replace("#", "")).trigger("change");
            };
          })(this)), 10);
        });
        hueInput.on("change", function() {
          var hex, hexBright, hsl, hueVal;
          hueVal = $(this).val();
          hsl = getHSL(hueVal);
          hex = HSLToHex(hsl.hue, hsl.saturation, hsl.lightness);
          hexBright = HSLToHex(hsl.hue, 100, 50);
          hexField.val(hex);
          updateColorPreview(hex);
          updateGradientBox(hexBright);
          picker.trigger("kleur.change");
        });
        spectrum.on("mousedown", function(event) {
          event.preventDefault();
          movePin(event);
          spectrum.addClass("active");
          $(document).on("mousemove", movePin);
        });
        $(document).on("mouseup", function() {
          spectrum.removeClass("active");
          $(document).off("mousemove", movePin);
        });
        spectrum.on("touchmove touchstart", movePin);
        hexField.on("click focus", function(e) {
          e.stopPropagation();
        });
        spectrum.on("touchmove touchstart click", function(e) {
          e.stopPropagation();
        });
        hueInput.on("click touchmove touchstart", function(e) {
          e.stopPropagation();
        });
        picker.on('kleur.change', function() {
          $(this).data('color', hexField.val());
          if (settings.changeCallback && typeof settings.changeCallback === "function") {
            return settings.changeCallback.call();
          }
        });

        /* Public Methods */
        hsl = function() {
          hsl = hexToHSL(picker.data('color'));
          return "hsl(" + hsl.hue + "," + hsl.saturation + "," + hsl.luminosity + ")";
        };
        hex = function() {
          return "#" + picker.data('color');
        };
        rgb = function() {
          rgb = hexToRGB(picker.data('color'));
          return "rgb(" + rgb.red + "," + rgb.green + "," + rgb.blue + ")";
        };

        /* Fire it up */
        return init();
      });
    }
  });
})(jQuery);
