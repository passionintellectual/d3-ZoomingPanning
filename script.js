window.chartBuilder =   {};
(function(ns) {

    function getMargin() {
        var margin = {top: 20, right: 15, bottom: 60, left: 60};
        var width = 960 - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;
        return {margin: margin, width: width, height: height};
    }

    function getData() {
        var data = [[5, 3], [10, 17], [15, 4], [2, 8]];
        return data;
    }

//function defineScales(data, width, height) {
//    var x = d3.scale.linear()
//        .domain([0, d3.max(data, function (d) {
//            return d[0];
//        })])
//        .range([0, width]);
//
//    var y = d3.scale.linear()
//        .domain([0, d3.max(data, function (d) {
//            return d[1];
//        })])
//        .range([height, 0]);
//    return {x: x, y: y};
//}
    function defineYScale(data, domain, range) {
        var domainArr = domain;
        if (!domain || domain.length == 0) {
            domainArr = [0, d3.max(data, function (d) {
                return d[1];
            })];
        }
        var y = d3.scale.linear()
            .domain(domainArr)
            .range(range);

        return y;
    }

    function defineXScale(data, domain, range) {
        var domainArr = domain;
        if (!domain || domain.length == 0) {
            domainArr = [d3.min(data, function (d) {
                return d[0];
            }), d3.max(data, function (d) {
                return d[0];
            })];
        }

        var x = d3.scale.linear()
            .domain(domainArr)
            .range(range);
        return x;
    }

    function getSvg(width, margin, height) {
        var chart = d3.select('body')
            .append('svg:svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .attr('class', 'chart');
        return chart;
    }

    function getContainerGroup(chart, margin, width, height) {
        var main = chart.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'main');
        return main;
    }

    function renderXAxis(x, main, height) {
        var xAxis = d3.svg.axis()
            .scale(x)

            .orient('bottom');
        var xAxisElement = main.select('.x.axis');
        if (xAxisElement.empty()) {
            xAxisElement = main.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .attr('class', 'x axis')
        }
        xAxisElement.call(xAxis);

        return xAxis;
    }

    function renderYAxis(y, main) {
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');
        var yAxisElement = main.select('.y.axis');
        if (yAxisElement.empty()) {

            yAxisElement = main.append('g')
                .attr('transform', 'translate(0,0)')
                .attr('class', 'y axis');
        }
        yAxisElement.call(yAxis);
        return yAxis;
    }

    function renderScatterplot(main, data, scales) {
        var g = main.append("svg:g");
        var divTooltip = d3.select('.tooltip1');
        if (divTooltip.empty()) {
            divTooltip = d3.select('body').append('div')
                .attr('class', 'tooltip1')
                .style('opacity', 0);
        }

        g.selectAll("scatter-dots")
            .data(data, function (d, i) {
                return i;
            })
            .enter().append("svg:circle")
            .attr("cx", function (d, i) {
                return scales.x(d[0]);
            })
            .attr("cy", function (d) {
                return scales.y(d[1]);
            })
            .on('click', function (d) {

                log(d.toString());


            })

            .attr("r", 8);
    }

    function addZoomRect(main, scales, zoom) {
        var zoomRect = main.append('rect')
            .attr('width', function () {
                return scales.x(d3.max(scales.x.domain()));
            })
            .attr('height', function () {
                return scales.y(d3.min(scales.y.domain()));
            })
            .attr('x', 0)
            .attr('y', 0)
            .attr('fill', 'transparent')
            .attr('stroke', 'red');
        if (zoom) {
            zoomRect.call(zoom);
        }
        return zoomRect;
    }

    function restrictYPanning(zoom) {
        var zoomTranslate = this.translate();
        this.translate([zoomTranslate[0], 0]);
    }

    function addXScrollEndEvent(scales, direction, data) {
        var zoomTranslate = this.translate();
        var   condition;
        var currentDomainMax = d3.max(scales.x.domain());
            var dataMax = d3.max(data, function(d){return d[0];});
        var currentDomainMin = d3.min(scales.x.domain());
        var dataMin =
            d3.min(data, function(d){return d[0];});
if(currentDomainMax > dataMax && direction === 'right'){
    //log('currentDomainMax ', currentDomainMax);
    //log('dataMax ', dataMax);
    //log('----------------');
    condition = true;
}

        if( dataMin > currentDomainMin && direction ===  'left'){
            //log('currentDomainMin ', currentDomainMin);
            //log('dataMin ', dataMin);
            //log('----------------');
            condition = true;
        }
        //var xRightLimit, xTranslate;
        //if (direction === 'right') {
        //    xRightLimit = scales.x(d3.max(scales.x.domain())) - (getMargin().width + 60);
        //
        //    xTranslate = 0 - zoomTranslate[0];// + scales.x(d3.min(scales.x.domain()));
        //
        //    condition = xTranslate > xRightLimit;
        //} else {
        //    xRightLimit = scales.x(d3.min(scales.x.domain()));
        //
        //    xTranslate = zoomTranslate[0];// + scales.x(d3.min(scales.x.domain()));
        //
        //    condition = xTranslate > xRightLimit;
        //}
        return condition;
    }

    function onZoom(zoom, main, xAxis, yAxis, scales, data) {
        //var xAxis = d3.svg.axis()
        //    .scale(scales.x)
        //    .orient('bottom');
        //var yAxis = d3.svg.axis()
        //    .scale(scales.y)
        //    .orient('left');
        //alert(data);
        var translate = zoom.translate();
        var direction = '';

        if (translate[0] < ns.lastTranslate[0]) {
            direction = 'right';
        }
        else {
            direction = 'left';
        }
        ns.lastTranslate = translate;//d3.transform(main.attr('transform')).translate  ;
        log('zoom translate', ns.lastTranslate);
        log('d3 Event translate', d3.event.translate);
        window.scales =  scales;
        window.data = data;


       // ns.lastTranslate = translate;

        var divTooltip = d3.select('.tooltip1');
        if (divTooltip.empty()) {
            divTooltip = d3.select('body').append('div')
                .attr('class', 'tooltip1')
                .style('opacity', 0);
        }


        restrictYPanning.call(zoom);
        var xScrollEndCondition = addXScrollEndEvent.call(zoom, scales, direction, data);
if (xScrollEndCondition) {
            if (zoom.onXScrollEnd) {

                zoom.onXScrollEnd.call(this, {
                    'translate': translate,
                    'direction': direction

                });
            }
        }


        main.select(".x.axis").call(xAxis);
        main.select(".y.axis").call(yAxis);
        var dataElements = main.selectAll("circle")
            .data(data, function (d, i) {
                return i;
            });

        dataElements.attr("cx", function (d, i) {
            return scales.x(d[0]);
        })
            .attr("cy", function (d) {
                return scales.y(d[1]);
            }).attr("r", 8);

        dataElements.enter().append("svg:circle")
            .attr("cx", function (d, i) {
                return scales.x(d[0]);
            })
            .attr("cy", function (d) {
                return scales.y(d[1]);
            }).on('click', function (d) {

                log(d.toString());


            })

            .attr("r", 8);
        log(direction);



    }

//var xRangeMax;
//var xRangeMin;
    ns.lastTranslate = [0, 0];

    /**
     * Created by Lenovo on 7/4/2015.
     */
    function log(titlee, msgg) {
       var msg = msgg;

        var title ;
        if(titlee){
            title = titlee +':-->';
        }

        if(!msgg){
           msg = titlee;
            title = '';
       }else{
            if(Array.isArray(msgg)  ){
                msg = msgg.toString();
            }
            if (  (typeof msg === "object") && (msg !== null))  {
                msg = JSON.stringify(msg );
            }
        }

    var tooltip =  d3.select('.tooltip1');
        var earlierMsg = tooltip.html();
        var num = tooltip.attr('data-serial') || 0;
        num =  parseInt(num) + 1;

        msg = '<div style="border-bottom:solid 1px green"><span style="color:white">'+num+')</span><strong>'+title+'</strong> '+ decodeURIComponent( msg)+ ' </div>';
    tooltip.html('<br>' + msg + '<br>'+earlierMsg).style({
            'color': 'lightGray',
            'background': 'darkGray',
            'font-family': 'courier',
            'opacity': 1,
            'max-height':'200px',
            'overflow':'auto'
        })
        .attr('data-serial',num);
    }

    function addLoggerDiv() {
        var divTooltip = d3.select('.tooltip1');
        if (divTooltip.empty()) {
            divTooltip = d3.select('body').append('div')
                .attr('class', 'tooltip1')
                .style({
                    'opacity': 0,
                    'position':'relative'
                });

            d3.select('body')  .append('div')
                .text('close')
                .style({
                  'top':0,
                    'right':0,
                    'position':'absolute',
                    'background':'red',
                    'color':'white',
                    'cursor':'pointer'
                })
                .on('click', function(){
                    var thisItem = divTooltip;
                    var txt = thisItem.text();
                    var display = 'none';
                    if(txt === 'close'){
                        thisItem.text('open');
                        display = 'none';
                    }else{
                        thisItem.text('close');
                        display = 'block';
                    }
                  devTooltip.style('display', display);

                });

            d3.select('body')  .append('div')
                .text('clear')
                .style({
                  'top':0,
                    'right':20,
                    'position':'absolute',
                    'background':'red',
                    'color':'white',
                    'cursor':'pointer'
                })
                .on('click', function(){
                    divTooltip.html('');
                    divTooltip.attr('data-serial', '0');
                });
        }
    }



    $(document).ready(function () {
        var data = getData();
        var __ret = getMargin();
        var margin = __ret.margin;
        var width = __ret.width;
        var height = __ret.height;
        var scales = {};
        var xRangeMax = width  ;
        scales.x = defineXScale(data, [], [0, xRangeMax]);
        scales.y = defineYScale(data, [], [height, 0]);
        addLoggerDiv();
        var svg = getSvg(width, margin, height);
        var main = getContainerGroup(svg, margin, width, height);
        // draw the x axis
        var xAxis = renderXAxis(scales.x, main, height);
        // draw the y axis
        var yAxis = renderYAxis(scales.y, main);

        var thisobj = this;
        var zoom = d3.behavior.zoom().x(scales.x).y(scales.y).scaleExtent([1, 1]).on('zoom', function () {
            onZoom.call(null, zoom, main, xAxis, yAxis, scales, data);
        });
        zoom.onXScrollEnd = function (e) {
            var maxX = d3.max(data, function (d) {
                return d[0];
            });
            var minX = d3.min(data, function (d) {
                return d[0];
            });
            var incrementX = Math.floor((Math.random() * 3) + 1);
            var maxY = d3.max(data, function (d) {
                return d[1];
            })
            var minY = d3.min(data, function (d) {
                return d[1];
            })
            var incrementY = Math.floor((Math.random() * 1) + 16);
            var xRangeMin1, xRangeMax1, dataPoint;
            if (e.direction === 'left') {
                incrementX = incrementX * -1;
                dataPoint = minX + incrementX;
                log('dataPoint ', dataPoint);

                //xRangeMin1 = d3.min(scales.x.range()) - Math.abs(scales.x(minX) - scales.x(dataPoint));
                xRangeMin1 = scales.x(dataPoint);
                xRangeMax1 = d3.max(scales.x.range());
            } else {
                dataPoint = maxX + incrementX;
                log('dataPoint ', dataPoint);

                //xRangeMax1 = d3.max(scales.x.range()) + (scales.x(dataPoint) - scales.x(maxX));
                xRangeMax1 =  d3.max(scales.x.range()) + 20; //scales.x(dataPoint);
                xRangeMin1 = d3.min(scales.x.range())//e.translate[0];

            }
             data.push([dataPoint, incrementY]);

            //scales = defineScales(data, width + incrementX, height );
//             scales.x = defineXScale(data, [], [xRangeMin1, xRangeMax1]);
//             scales.y = defineYScale(data, [], [height, 0]);

scales.x.domain(d3.extent(data, function(d){return d[0];}));
            x = scales.x;
            y = scales.y;
            xAxis = renderXAxis(scales.x, main, height);
            // draw the y axis
            yAxis = renderYAxis(scales.y, main);
            zoom.x(scales.x).y(scales.y);


        }
        var zoomRect = addZoomRect(main, scales, zoom);


        renderScatterplot(main, data, scales);

    });
})(window.chartBuilder);