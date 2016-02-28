window.Page = (->

  init: ->
    $('[data-init="data-init"]').addClass 'init'
    $(document).on 'click', '.map_link', (e, data) ->
      Page.drawMap()
      e.preventDefault()
      false
    false

  drawMap: (data) ->
    template = Handlebars.compile $('[template="address_map"]').html()
    if(typeof window.map == 'undefined')
      script = document.createElement('script')
      script.onload = () ->
        Modal.show(template, $('body'))
        Page.initMap()
        false

      script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD-rRs1O8Xn8RimjoQ-dKurAD5R1bRfN0A&signed_in=true"
      script.async = true
      document.getElementsByTagName('head')[0].appendChild(script)
      false
    else
      Modal.show(template, $('body'))
      Page.initMap()
      false

  initMap: ->
    customMapType = new google.maps.StyledMapType([
        {
            "featureType": "landscape",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "stylers": [
                {
                    "hue": "#00aaff"
                },
                {
                    "saturation": -100
                },
                {
                    "gamma": 2.15
                },
                {
                    "lightness": 12
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "lightness": 24
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {
                    "lightness": 57
                }
            ]
        }
        ], {
        name: 'Custom Style'
    });
    customMapTypeId = 'custom_style';
    coords = {lat: 57.1117155, lng: 65.5466005}

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: coords,
        mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, customMapTypeId]
        }
    });
    marker = new google.maps.Marker({
        position: coords,
        map: map,
        title: 'Das Brilliant'
    });
    map.mapTypes.set(customMapTypeId, customMapType);
    map.setMapTypeId(customMapTypeId);
)()