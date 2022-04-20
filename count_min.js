let timer;
function control_ctm () {
    // let test = new Array(5);
    // test.fill(0);
    // for (let i = 0; i < test.length; i++) {
    //     test[i] = 1;
    //     console.log(test);
    // }
    // 
    // if (timer === true) {
    //     timer.stop();
    // }
    let input_dim = 7;
    let output_dim = parseInt(document.getElementById("output_dim_ctm").value);
    let input_size = parseInt(document.getElementById("input_size_ctm").value);
    let hash_num = parseInt(document.getElementById("hash_fun_num_ctm").value);
    input_size = input_size ? input_size : 1
    input_size = input_size <= 200 ? input_size : 200
    output_dim = output_dim ? output_dim : 0
    output_dim = output_dim <= 10 ? output_dim : 10
    hash_num = hash_num ? hash_num : 1
    hash_num = hash_num <= 20 ? hash_num : 20
    console.log(input_size);
    console.log(input_dim);
    console.log(output_dim);
    console.log(hash_num);

    let input_len = Math.floor(Math.pow(2, input_dim));
    let input_set = generate_input_repetition(input_size, input_dim);
    let x = input_set.input;
    let set = input_set.set;
    let index = new Array(input_len);
    for (let item of set) {
        index[item] = new Array(hash_num);
    }

    let h = new Array(hash_num);
    for (let i = 0; i < h.length; i++) {
        h[i] = generate_matrix(output_dim, input_dim);
    }
    for (let item of set) {
        for (let i = 0; i < h.length; i++) {
            let idx = vector2value(matrix_multiply_mod2(h[i], value2vector(item, input_dim)));
            index[item][i] = idx;
        }
    }
    console.log(x)
    console.log(set);
    console.log(index);

    let output_len = Math.floor(Math.pow(2, output_dim));
    // let result = new Array(input_size + 1);
    // for (let i = 0; i < result.length; i++) {
    //     result[i] = new Array(output_len);
    // }
    let A = new Array(hash_num);
    for (let i = 0; i < A.length; i++) {
        A[i] = new Array(output_len);
        A[i].fill(0);
    }

    let input = new Array(input_len);
    input.fill(0);
    let result = new Array(input_len);
    result.fill(0);
    let i = 0;

    d3.selectAll('#ctm_plot_div').remove();
    let ctm_plot_parent = document.querySelector("#ctm_plot");
    let ctm_plot_div = document.createElement('div');
    ctm_plot_parent.appendChild(ctm_plot_div);
    ctm_plot_div.id = "ctm_plot_div";

    // for (let i = 0; i < x.length; i++) {
    // for (let i = 0; i < 2; i++) {
    let plot = function (e) {
        // console.log(e);
        let value = x[i].value;
        input[value]++;
        // console.log(value);
        for (let j = 0; j < index[value].length; j++) {
            A[j][index[value][j]]++;
        }
        for (let item of set) {
            let min = input_size + 1;
            for (let k = 0; k < index[item].length; k++) {
                min = Math.min(min, A[k][index[item][k]]);
                // console.log("k: " + k + " item: " + item + " value: " + A[k][index[item][k]]);
            }
            // console.log(min);
            result[item] = min;
            // console.log("i: " + i + " item: " + item + " value: " + result[item]);
        }
        // console.log(result);
        // console.log(result.slice());

        d3.selectAll('#ctm_plot_div svg').remove();
        d3.selectAll('#ctm_plot_div div').remove();
        const max_y = Math.floor(Math.max.apply(null, result.slice()) + 5);
        let text_plot_input = d3.select("#ctm_plot_div").append("div");
        text_plot_input.html("<br>The frequency of input:");
        ctm_plot(input.slice(), null, [0, input_len], max_y);
        let text_plot_est = d3.select("#ctm_plot_div").append("div");
        text_plot_est.html("The estimate frequency of input:");
        ctm_plot(input.slice(), result.slice(), [0, input_len], max_y);
        i++;
        if (i >= x.length) {
            timer.stop();
        }
    }
    timer = d3.interval(plot, 1000);
}

function reset_ctm () {
    timer.stop();
    d3.selectAll('#ctm_plot_div').remove();
}

function generate_input_repetition (size, input_dim) {
    const set = new Set();
    const max = Math.floor(Math.pow(2, input_dim));

    let input = new Array(size);
    for (let i = 0; i < input.length; i++) {
        let num = getRandomInt(max);
        input[i] = {value: num, vector: value2vector(num, input_dim)};
        set.add(num);
    }

    return {input: input, set: set};
}

function ctm_plot (input, data, range, max_y) {
    const width = 700;
    const height = 400;
    const margin = {top:40, bottom: 40, left: 40, right: 40};

    const svg = d3.select('#ctm_plot_div') 
        .append('svg')
        .attr('height', height - margin.top - margin.bottom)
        .attr('width', width - margin.left - margin.right)
        .attr('viewBox', [0, 0, width, height]);

    const x = d3.scaleBand() //注1
        .domain(d3.range(range[0], range[1] + 1)) //注4
        .range([margin.left, width - margin.right]) //注5
        .paddingInner(0.5); //注3

    const y = d3.scaleLinear() //注2
        .domain([0, max_y]) //注4
        .range([height - margin.bottom, margin.top]) //注5

    if (data) {
        svg
        .append("g") //注6
        .attr("fill", 'royalblue') //注7
        .selectAll("rect") //注8
        .data(data) //注9
        .join("rect") //注10
                .attr("x", (d, i) => x(i + range[0])) //注11
                .attr("y", d => y(d)) //注12
                .attr('height', d => y(0) - y(d)) //注13
                .attr('width', x.bandwidth()); //注14
    }
    
    svg
    .append("g") //注6
    .attr("fill", 'red') //注7
    .selectAll("rect") //注8
    .data(input) //注9
    .join("rect") //注10
            .attr("x", (d, i) => x(i + range[0])) //注11
            .attr("y", d => y(d)) //注12
            .attr('height', d => y(0) - y(d)) //注13
            .attr('width', x.bandwidth()); //注14
    
    

    function yAxis(g) {
        g.attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y).tickFormat(d => d - parseInt(d) > 0.1 ? null : parseInt(d)))
            .attr("font-size", '20px')
        }
        
    function xAxis(g) {
        g.attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(i => (i % (Math.floor((range[1] - range[0]) / 10) + 1)) === 0 ? i : null))
            .attr("font-size", '20px')
        }

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("numbers");
    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("frequency");
    svg.node(); //15
}