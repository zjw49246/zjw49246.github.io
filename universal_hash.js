function control_hash () {
    let input_dim = parseInt(document.getElementById("input_dim").value);
    let output_dim = parseInt(document.getElementById("output_dim").value);
    let input_size = parseInt(document.getElementById("input_size").value);
    input_dim = input_dim ? input_dim : 0
    input_dim = input_dim <= 20 ? input_dim : 15
    output_dim = output_dim ? output_dim : 0
    output_dim = output_dim <= 10 ? output_dim : 10
    input_size = input_size ? input_size : 1
    input_size = input_size <= 200 ? input_size : 200
    console.log(input_dim);
    console.log(output_dim);
    console.log(input_size);

    const max = Math.floor(Math.pow(2, input_dim));
    const size = input_size <= max ? input_size : max

    let A = generate_matrix(output_dim, input_dim);
    console.log(A);

    d3.selectAll('#hash_plot_div').remove();
    let hash_plot_parent = document.querySelector("#hash_plot");
    let hash_plot_div = document.createElement('div');
    hash_plot_parent.appendChild(hash_plot_div);
    hash_plot_div.id = "hash_plot_div";
    let text_matrix = d3.select("#hash_plot_div").append("div");
    text_matrix.html("<br>The random matrix A:");
    let table = d3.select("#hash_plot_div").append("table");
    let tr = table.selectAll("tr")
        .data(A)
        .enter()
        .append("tr");
    let td = tr.selectAll("td")
        .data(function(d) { return d; })
        .enter()
        .append("td");
    let content = td.text(function(d) { return d; });
    // const matrix = {
    //     values: A,
    //     labels: []
    // }
    // const chart_options = {
    //     container: "#Matrix",
    //     show_labels : true,
    //     start_color : '#ffffff',
    //     end_color : '#3498db',
    //     width: 400,
    //     height: 400,
    //     margin: {top: 50, right: 50, bottom: 100, left: 100},
    //     highlight_cell_on_hover: true,
    //     highlight_cell_color: '#2ecc71'
    // };

    // Matrix(matrix,chart_options);


    let x = generate_input(size, input_dim);
    console.log(x);

    let hx = new Array(size);
    for (let i = 0; i < hx.length; i++) {
        let hxVec = matrix_multiply_mod2(A, x[i].vector);
        hx[i] = {value: vector2value(hxVec), vector: hxVec};
    }
    console.log(hx);

    data_range_x = value2data(x, input_dim);
    data_x = data_range_x.data
    range_x = data_range_x.range
    data_range_hx = value2data(hx, output_dim);
    data_hx = data_range_hx.data
    range_hx = data_range_hx.range

    let text_plot_x = d3.select("#hash_plot_div").append("div");
    text_plot_x.html("<br>The distribution of input values:");
    hash_plot(data_x, range_x);
    let text_plot_hx = d3.select("#hash_plot_div").append("div");
    text_plot_hx.html("<br>The distribution of output hash values:");
    hash_plot(data_hx, range_hx);

    let pair_num = size * (size - 1) / 2;
    let collide_num = 0;
    for (let i = 0; i < data_hx.length; i++) {
        collide_num += data_hx[i] * (data_hx[i] - 1) / 2;
    }
    let collide_rate = collide_num / pair_num;
    let collide_rate_bar = 1 / Math.pow(2, output_dim);
    let text_collide_rate = d3.select("#hash_plot_div").append("div");
    text_collide_rate.html(`<br>The collision rate: ${collide_rate * 100}%
                            <br> 1/<i>M</i> = ${collide_rate_bar * 100}%`);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function generate_matrix (output_dim, input_dim) {
    let A = new Array(output_dim);

    for (let i = 0; i < A.length; i++) {
        A[i] = new Array(input_dim);
        for (let j = 0; j < A[i].length; j++) {
            A[i][j] = getRandomInt(2);
        }
    }

    return A;
}

function generate_input (size, input_dim) {
    const set = new Set();
    const max = Math.floor(Math.pow(2, input_dim));

    let input = new Array(size);
    for (let i = 0; i < input.length;) {
        let num = getRandomInt(max);
        if (!set.has(num)) {
            input[i] = {value: num, vector: value2vector(num, input_dim)};
            set.add(num);
            i++;
        }
    }

    return input;
}

function value2vector (value, input_dim) {
    let vec = new Array(input_dim);
    let num = value;
    for (let i = vec.length - 1; i >= 0; i--) {
        vec[i] = num % 2;
        num = Math.floor(num / 2);
    }

    return vec;
}

function vector2value (vector) {
    let value = 0;
    for (let i = 0; i < vector.length; i++) {
        value *= 2;
        value += vector[i];
    }

    return parseInt(value);
}

function matrix_multiply_mod2 (A, x) {
    let result = new Array(A.length);
    for (let i = 0; i < A.length; i++) {
        let sum = 0;
        for (let j = 0; j < A[i].length; j++) {
            sum += A[i][j] * x[j];
        }
        result[i] = sum % 2;
    }

    return result;
}

function value2data (x, dim) {
    // let min = Math.floor(Math.min.apply(null, x.map(v => v.value)));
    // let max = Math.floor(Math.max.apply(null, x.map(v => v.value)));
    // console.log(min)
    // console.log(max);

    // let data = new Array(max - min + 1);
    // data.fill(0);
    // for (let i = 0; i < x.length; i++) {
    //     data[x[i].value - min] += 1;
    // }

    // return {data: data, range: [min, max]};

    let len = Math.floor(Math.pow(2, dim));

    let data = new Array(len);
    data.fill(0);
    for (let i = 0; i < x.length; i++) {
        data[x[i].value] += 1;
    }

    return {data: data, range: [0, len - 1]};
}

function hash_plot (data, range) {
    const width = 700;
    const height = 400;
    const margin = {top:40, bottom: 40, left: 40, right: 40};
    const max_y = Math.floor(Math.max.apply(null, data) + 5)

    const svg = d3.select('#hash_plot_div') 
        .append('svg')
        .attr('height', height - margin.top - margin.bottom)
        .attr('width', width - margin.left - margin.right)
        .attr('viewBox', [0, 0, width, height]);

    const x = d3.scaleBand() //注1
        .domain(d3.range(range[0], range[1] + 1)) //注4
        .range([margin.left, width - margin.right]) //注5
        .paddingInner(0.1); //注3

    const y = d3.scaleLinear() //注2
        .domain([0, max_y]) //注4
        .range([height - margin.bottom, margin.top]) //注5


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