# TAKJO Code Smell Visualizer

CPSC410 Visualization project by TAKJO

## Members
- Jakrarat (Jade) Chunnananda
- Kenny Kwan
- Tim Guo
- Oscar Tu
- Sadek

## About
Here is a sample visualization analyzing the JXGraph library. 

![Visualizer Preview](https://i.imgur.com/zLvyqmU.png)
![Method Metrics](https://imgur.com/eMnE5Is.png)

The Code Smell Visualizer allows Java project developers to quickly identify problematic classes that show signs of code smell. We analyze methods in each class for 5 different measures of code smell, which are:
* Law of Demeter
* Number of Lines
* Number of Parameters 
* Max Nested Depth
* Unused Methods

Our project has 2 components, the analyzer and the visualizer.

The analyzer is responsible for parsing and analyzing all the measures of code smell in a Java project. The analyzer then outputs a JSON file containing all calculated metrics and allows the user to start up a simple local web-app to view their metrics on their browser as an undirected graph, where each node represents a class. 

The graph allows the user to easily view the overall code smell score of the class as a whole as well as the individual methods' metrics by simply clicking on the node representing that class. Individual method metrics are displayed as by a grouped bar chart graph. The visualization is color coded such that classes that display high code smell are marked as red, medium code smell as yellow, and low code smell as green. The size of the nodes are determined by the size of the class. This makes it easy for users to identify which classes need attention. 

### Division of Labour
* Jade: Unwanted Methods Analyzer
* Kenny: Visualization (D3) and web-app
* Tim: Lines Analyzer
* Oscar: Law of Demeter Analyzer
* Sadek: Utils, Nesting Analyzer
* Everyone: Bugs, optimization.

## Set up
`git clone` this repository

`yarn install` to install dependencies

`yarn start` to start a http server serving the files, then in a browser go to http://127.0.0.1:9001 to access the UI

