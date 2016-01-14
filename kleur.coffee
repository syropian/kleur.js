## kleur.js - A simple, flexible colorpicker based on Purty Picker
( ($) ->
  $.fn.extend
    kleur: (opts) ->
      settings =
        initialColor: '#ff0000'
        onChange: (hex, rgb, hsl) -> undefined
      settings = $.extend settings, opts
      log = (msg) ->
        console?.log msg

      HSLToRGB = (h, s, l) ->
        h /= 360
        s /= 100
        l /= 100
        r = undefined
        g = undefined
        b = undefined
        if s is 0
          r = g = b = l # Achromatic
        else
          hueToRGB = (p, q, t) ->
            t += 1  if t < 0
            t -= 1  if t > 1
            return p + (q - p) * 6 * t  if t < 1 / 6
            return q  if t < 1 / 2
            return p + (q - p) * (2 / 3 - t) * 6  if t < 2 / 3
            p

          q = (if l < 0.5 then l * (1 + s) else l + s - l * s)
          p = 2 * l - q
          r = hueToRGB(p, q, h + 1 / 3)
          g = hueToRGB(p, q, h)
          b = hueToRGB(p, q, h - 1 / 3)
        red: Math.round(r * 255)
        green: Math.round(g * 255)
        blue: Math.round(b * 255)

      RGBToHSL = (r, g, b) ->
        r /= 255
        g /= 255
        b /= 255

        max = Math.max(r, g, b)
        min = Math.min(r, g, b)
        h = undefined
        s = undefined
        l = (max + min) / 2
        if max is min
          h = s = 0 # Achromatic
        else
          d = max - min
          s = (if l > 0.5 then d / (2 - max - min) else d / (max + min))
          switch max
            when r
              h = (g - b) / d + ((if g < b then 6 else 0))
            when g
              h = (b - r) / d + 2
            when b
              h = (r - g) / d + 4
          h /= 6
        hue: Math.round(h * 360)
        saturation: Math.round(s * 100)
        luminosity: Math.round(l * 100)

      RGBToHex = (r, g, b) ->
        ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice 1

      hexToRGB = (hex) ->
        bigInt = parseInt(hex, 16)
        r = (bigInt >> 16) & 255
        g = (bigInt >> 8) & 255
        b = bigInt & 255
        red: r
        green: g
        blue: b

      hexToHSL = (hex) ->
        RGB = hexToRGB(hex)
        RGBToHSL RGB.red, RGB.green, RGB.blue

      HSLToHex = (h, s, l) ->
        RGB = HSLToRGB(h, s, l)
        RGBToHex RGB.red, RGB.green, RGB.blue

      RGBtoHSV = (r,g,b) ->
        r = r / 255
        g = g / 255
        b = b / 255

        max = Math.max(r, g, b)
        min = Math.min(r, g, b)
        h = undefined
        s = undefined
        v = max
        d = max - min
        s = (if max is 0 then 0 else d / max)
        if max is min
          h = 0 # achromatic
        else
          switch max
            when r
              h = (g - b) / d + ((if g < b then 6 else 0))
            when g
              h = (b - r) / d + 2
            when b
              h = (r - g) / d + 4
          h /= 6
        hsv =
          hue: h
          saturation: s
          value: v


      clamp = (num, min, max) ->
        num = max  if num > max
        num = min  if num < min
        num

      return @each () ->
        picker = $(@)
        color = settings.initialColor.replace("#", "")
        adjuster = picker.find(".kleur-adjuster")
        hexField = picker.find(".kleur-hex")
        hueInput = picker.find(".kleur-hue")
        pin = picker.find(".kleur-spectrum-pin")
        preview = picker.find(".kleur-preview")
        spectrum = picker.find(".kleur-spectrum")

        init = ->
          hsl = hexToHSL(color)
          hexField.val(color)
          hueInput.val(hsl.hue)
          updateGradientBox( HSLToHex(hsl.hue, 100, 50) )
          updateColorPreview(color)
          setPinPositionForColor(hsl)

        getHSL = (h, x, y) ->
          hue = parseInt(h, 10)
          hue = 0  if hue is 360
          hsv_value = 1 - (y / 100)
          hsv_saturation = x / 100
          lightness = (hsv_value / 2) * (2 - hsv_saturation)
          saturation = (hsv_value * hsv_saturation) / (1 - Math.abs(2 * lightness - 1))
          if isNaN(saturation)
            saturation = hsv_saturation
          hsl =
            hue: hue
            saturation: clamp(saturation * 100, 0, 100)
            lightness: clamp(lightness * 100, 0, 100)



        updateColorPreview = (hex) ->
          preview.css("background-color": "#" + hex)

        updateGradientBox = (hex) ->
          spectrum.children('.spectrum-bg').css("background-color": "#" + hex)

        setColorsForPinPosition = ->
          hsl = getHSL(hueInput.val(), parseFloat(pin[0].style.left), parseFloat(pin[0].style.top))
          hex = HSLToHex(hsl.hue, hsl.saturation, hsl.lightness)
          hexField.val(hex)
          updateColorPreview hex
          return

        setPinPositionForColor = (hsl) ->
          rgb = HSLToRGB(hsl.hue, hsl.saturation,hsl.luminosity)
          hsv = RGBtoHSV(rgb.red, rgb.green, rgb.blue)
          pin.css
            left: (hsv.saturation * 100) + "%"
            top: ( 100 - (hsv.value * 100) ) + "%"
          return

        movePin = (event) ->
          offset = spectrum.offset()
          width = spectrum.width()
          height = spectrum.height()
          pinWidth = pin.width()
          pinHeight = pin.height()
          x = event.clientX - offset.left
          y = event.clientY - offset.top

          # Account for pin being dragged outside the spectrum area
          if x <= ( -(pinWidth / 2) )
            x = 0
          else x = width  if x >= width + ( pinWidth / 2 )
          if y < (pinHeight / 2)
            y = 0
          else y = height  if y >= height + ( pinHeight / 2 )
          # Place the pin
          pin.css
            left: x / width * 100 + "%"
            top: y / height * 100 + "%"

          # Output new color value
          setColorsForPinPosition()
          picker.trigger("kleur.change")
          return

        ### Events ###
        hexField.on "keyup", ->
          hex = $(@).val()
          if hex.length > 6
            if hex[0] == '#'
              $(@).val(hex.substring(0,7))
            else
              $(@).val(hex.substring(0,6))

        hexField.on "change", ->
          HSL = {}
          hex = undefined
          if /([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g.test($(@).val())
            hex = $(@).val()
            HSL = hexToHSL(hex)
          else
            hex = color
            $(@).val hex
            HSL = hexToHSL(hex)
          setPinPositionForColor(HSL)

          #Update hue
          hueInput.val(HSL.hue)
          updateGradientBox( HSLToHex(HSL.hue, 100, 50) )
          updateColorPreview(hex)
          picker.trigger("kleur.change")
          return

        hexField.on "paste", ->
          setTimeout (=>
            $(@).val($(@).val().replace("#", "")).trigger("change")
          ), 10
          return

        hueInput.on "change", ->
          hueVal = $(@).val()
          hsl = getHSL(hueVal, parseFloat(pin[0].style.left), parseFloat(pin[0].style.top))
          hex = HSLToHex(hsl.hue, hsl.saturation, hsl.lightness)
          hexBright = HSLToHex(hsl.hue, 100, 50) # We want the spectrum color to have the chosen hue, but with saturation and luminosity on full
          hexField.val(hex)
          updateColorPreview(hex)
          updateGradientBox(hexBright)
          picker.trigger("kleur.change")
          return

        spectrum.on "mousedown", (event) ->
          event.preventDefault()
          movePin event
          spectrum.addClass "active"
          $(document).on "mousemove", movePin
          return

        $(document).on "mouseup", ->
          spectrum.removeClass "active"
          $(document).off "mousemove", movePin
          return

        spectrum.on "touchmove touchstart", movePin

        #Stop propagation on interactive els
        hexField.on "click focus", (e) ->
          e.stopPropagation()
          return

        spectrum.on "touchmove touchstart click", (e) ->
          e.stopPropagation()
          return

        hueInput.on "click touchmove touchstart", (e) ->
          e.stopPropagation()
          return

        picker.on('kleur.change', ->
          $(@).data('color', "#" + hexField.val())
          if settings.onChange and typeof settings.onChange is "function"
            hex = $(@).data('color')
            rgb = hexToRGB( $(@).data('color').slice 1 )
            hsl = hexToHSL( $(@).data('color').slice 1 )
            color =
              hex: hex
              rgb: "rgb(#{rgb.red},#{rgb.green},#{rgb.blue})"
              hsl: "hsl(#{hsl.hue},#{hsl.saturation},#{hsl.luminosity})"
            settings.onChange.apply(null, [color])
        )


        init()

) jQuery
