/**
* Slidebox Directive
*
* version 0.9
* http://github.com/keithjgrant/slidebox
*
* by Keith J Grant
* http://elucidblue.com
*/
angular.module('Slidebox', [])

.directive('slidebox', function slideboxDirective () {
    return {
        template: '<div class="slidebox-container">' +
                    '<div class="slidebox">' +
                      '<div ng-transclude class="slidebox-content"></div>' +
                    '</div>' +
                    '<div class="slidebox-controls slidebox-up"></div>' +
                    '<div class="slidebox-controls slidebox-down"></div>' +
                  '</div>',
        replace: true,
        transclude: true,
        restrict: 'AE',
        scope: false,
        link: function (scope, element, attrs) {
            var content = element.children()[0],
                upEl = element.children()[1],
                downEl = element.children()[2],
                velocity = 0,
                defaultOpacity = Number(getComputedStyle(upEl).opacity),
                maxVelocity = Number(attrs.speed) || 25,
                interval,
                didScroll = true; // trigger an initial check on load

            if (attrs.contentWidth) {
                scope.$watch(attrs.contentWidth, function (value) {
                    if (value == Number(value)) {
                        value += 'px';
                    }
                    content.children[0].style.width = value;
                    didScroll = true;
                });
            }
            if (attrs.contentClass) {
                content.children[0].className += ' ' + attrs.contentClass;
            }

            function startScroll (isUp) {
                // set default velocity for touchdevices
                if (isUp) {
                    velocity = maxVelocity / -2;
                } else {
                    velocity = maxVelocity / 2;
                }
                interval = setInterval(function () {
                    content.scrollLeft += velocity;
                    didScroll = true;
                }, 50);
            }

            function stopScroll (controlEl) {
                clearInterval(interval);
                controlEl.style.opacity = defaultOpacity;
                velocity = 0;
            }

            function touchStart (controlEl, isUp) {
                startScroll();
                if (isUp) {
                    velocity = maxVelocity / -2;
                } else {
                    velocity = maxVelocity / 2;
                }
                controlEl.style.opacity = 1.0;
            }

            /**
             * Get scalar between 0 and 1 based on mouse position in element
             */
            function getVelocityScalar (element, clientY) {
                var height = element.offsetHeight,
                    topSide = element.getBoundingClientRect().top;
                return (clientY - topSide) / height;
            };

            function updateVelocity (controlEl, yPos, isUp) {
                var scale = getVelocityScalar(controlEl, yPos),
                    round,
                    opacityScalar;

                if (isUp) {
                    // scale is % from the left side; convert to negative %
                    // from the right:
                    scale -= 1;

                    controlEl.style.opacity = defaultOpacity + scale * -1;
                    round = Math.floor;
                } else {
                    controlEl.style.opacity = defaultOpacity + scale;
                    round = Math.ceil;
                }

                velocity = round(scale * maxVelocity);
            }

            /**
             * Hide control when scrolled all the way to the end
             */
            function updateControlVisability () {
                if (!didScroll) {
                    return;
                }

                if (content.scrollLeft === 0) {
                    upEl.style.display = 'none';
                } else {
                    upEl.style.display = 'block';
                }

                if (content.scrollLeft === content.scrollWidth - content.offsetWidth) {
                    downEl.style.display = 'none';
                } else {
                    downEl.style.display = 'block';
                }
                didScroll = false;
            }

            upEl.addEventListener('mouseover', function () {
                startScroll();
            }, false);
            upEl.addEventListener('mousemove', function (event) {
                updateVelocity(upEl, event.clientY, true);
            }, false);
            upEl.addEventListener('mouseout', function () {
                stopScroll(upEl);
            }, false);
            upEl.addEventListener('touchstart', function (event) {
                event.preventDefault(); // cancel mouse event
                touchStart(upEl, true);
            }, false);
            upEl.addEventListener('touchend', function (event) {
                event.preventDefault(); // cancel mouse event
                stopScroll(upEl);
            }, false);

            downEl.addEventListener('mouseover', function () {
                startScroll();
            });
            downEl.addEventListener('mousemove', function (event) {
                updateVelocity(downEl, event.clientY, false);
            });
            downEl.addEventListener('mouseout', function  () {
                stopScroll(downEl);
            }, false);
            downEl.addEventListener('touchstart', function (event) {
                event.preventDefault(); // cancel mouse event
                touchStart(downEl, false);
            }, false);
            downEl.addEventListener('touchend', function (event) {
                event.preventDefault(); // cancel mouse event
                stopScroll(downEl);
            }, false);

            content.addEventListener('scroll', function () {
                didScroll = true;
            });
            setInterval(updateControlVisability, 250);
        }
    };
})

;