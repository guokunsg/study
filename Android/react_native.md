# React-native
* Initialize
    ```
    react-native init project_name
    cd project_name
    react-native run-android
    ```

* Props: 
    - Components can be customized when they are created, with different props parameters. Fixed
* State: 
    - For data that is going to change
* Style: 
    ```
    <Text style={styles.red}></Text>
    const styles = StyleSheet.create({red: {color: 'red'}});
    ```
* Height and Width
    - Fixed dimensions:  
        unitless, and represent density-independent pixels  
        <View style={{width: 50, height: 50}}>
    - Flex Dimensions:  
        Components expand and shrink dynamically based on available space.  
        <View style={{flex: 1}}>  Value is weight
* Layout with Flexbox
    - flexDirection: determines the primary axis of its layout
    - justifyContent: determines the distribution of children along the primary axis
    - alignItems: determines the alignment of children along the secondary axis
    ```
    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}> ...other views... </View>
    ```
* Handling text input
    ```
    <TextInput onChangeText={(text) => this.setState({text})}>
    ```
* Handling Touches
    ```
    <Button onPress={()=> { ... }}>
    Touchable to wrap the button:
    <TouchableHighlight onPress={this._onPressButton} underlayColor="white">
          <View style={styles.button}> <Text style={styles.buttonText}>TouchableHighlight</Text> </View>
    </TouchableHighlight>
    <TouchableOpacity onPress={this._onPressButton}>
        <View style={styles.button}> <Text style={styles.buttonText}>TouchableOpacity</Text></View>
    </TouchableOpacity>
    ```
* ScrollView: 
    - a generic scrolling container that can host multiple components and views.
    ```
    <ScrollView> <Text/> <Image/> </ScrollView>
    ```
* ListViews: 
    - FlatList: displays a scrolling list of changing, but similarly structured data
    - SectionList: render a set of data broken into logical sections, maybe with section headers
* Networking:
    - Fetch API for networking needs. Or use XMLHttpRequest API
    ```
        fetch('https://mywebsite.com/endpoint/', {
            method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({ firstParam: 'yourValue', secondParam: 'yourOtherValue', }), })
        .then(response => {...}).catch(err => ...) // Or use await async
    ```
    - also supports WebSockets
