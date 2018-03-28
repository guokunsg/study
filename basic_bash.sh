#!/bin/bash

# Each script runs in its own process
# Be careful with spaces

echo Use echo to print message
echo Print path: PATH=$PATH

# To read a variable, use $var_name. To set, no $

# $0 is the name of the command
echo Name of this script: $0
# $1 to $9 to get the command arguments
echo First argument: $1 Second argument: $2
# $# is the number of arguments
echo Number of arguments: $#
# $@ is all the argument
echo All arguments: $@
# $? is the exit status of the most recently run process
echo Last exit status: $?
# The username of the user running the script.
echo Current user: $USER
# The hostname of the machine the script is running on.
echo Current host: $HOSTNAME
# The number of seconds since the script was started.
echo Time passed since script start: $SECONDS
# Returns a different random number each time is it referred to.
echo Random number: $RANDOM
# Returns the current line number in the Bash script.
echo Current line number: $LINENO

# Can use command env to get all the variables

# Set a variable. Note: There must not be spaces. Otherwise it is recognized as command
PI=3.1415926535
echo Own defined variable: $PI
# Print a blank line
echo 

# Single quotes will treat every character literally
echo 'Single quote print: $USER'
# Double quotes do substitution
echo "Double quote print: $USER"

# Use $( command ) to get the output of a command or program and save it as the value of a variable
files=$( ls )
echo Files in this directory: $files

# Use export to pass the variable to another script
export PI
# Call some other script and it will be able to use PI but changing PI value will not affect the current one

# Read input
# Use read var_name to read the input and stores into var_name
# -p 'prompt' -s silent (for password)
read -p "Enter anything: " USER_INPUT
echo Entered: $USER_INPUT

# Use let to do arithmetic, support +, -, \*, /, ++, --, %
let "N = 5 + 4"
echo 'let N = 5 + 4 output $N:' $N
# expr similar but print result directly.
# Multiply is \*
expr 5 \* 4
# Can use $ to store the result into a variable
N=$(expr 5 \* 4) 
echo 'N=$(expr 5 \* 4) output $N: ' $N
# Multiply is * in (( expression ))
N=$(( 9 * 9 )) 
echo 'N=$(( 9 * 9 )) output $N: ' $N

# Get the length of variable
NAME_LEN=${#USER}
echo 'Length of variable output ${#USER}:' $NAME_LEN

# If statement
# ! EXPRESSION          : The EXPRESSION is false.
# -n STRING	            : The length of STRING is greater than zero.
# -z STRING	            : The lengh of STRING is zero (ie it is empty).
# STRING1 = STRING2	    : STRING1 is equal to STRING2
# STRING1 != STRING2	: STRING1 is not equal to STRING2
# INTEGER1 -eq INTEGER2	: INTEGER1 is numerically equal to INTEGER2
# INTEGER1 -gt INTEGER2	: INTEGER1 is numerically greater than INTEGER2
# INTEGER1 -lt INTEGER2	: INTEGER1 is numerically less than INTEGER2
# -d FILE	            : FILE exists and is a directory.
# -e FILE	            : FILE exists.
# -r FILE	            : FILE exists and the read permission is granted.
# -s FILE	            : FILE exists and it's size is greater than zero (ie. it is not empty).
# -w FILE	            : FILE exists and the write permission is granted.
# -x FILE	            : FILE exists and the execute permission is granted.
# = is different from -eq. [ 001 = 1 ] is false but [ 001 -eq 1 ] is true
if [ $USER = 'bob' ] || [ $USER = 'peter' ]
then
    echo "You are bob or peter"
elif [ $NAME_LEN -eq 4 ]
then
    echo "User name length is 4"
    if [ -r $0 ]
    then
        echo "File $0 exists and can read" 
    fi
else
    echo "User name length > 4"
fi

# Case statement (similar to switch)
case $USER in
    bob)
        echo 'You are bob'
        ;;
    'test')
        echo 'You are test'
        ;;
    *)
        echo 'Who are you?'
        ;;
esac

# While loop
counter=1
while [ $counter -le 10 ]
do
    ((counter++))
done
echo "While loop counter is $counter"

# Until loop: Runs until test condifition is true
counter=1
until [ $counter -gt 10 ]
do
    ((counter++))
done
echo "Until loop counter is $counter"

# For loop: support break and continue
NAMES="alice bob peter"
for name in $NAMES
do 
    if [ $name = 'bob' ]
    then
        echo "Bob found"
        break
    fi
    echo $name
done
# For range: for value in {1..5}
# For range with step: for value in {10..0..2}      10 8 6 4 2 0

# Select a option
PS3='Select a name (select bob to end: '
select name in $NAMES
do
    if [ $name == 'bob' ]
    then
        break
    fi
done

# Functions
# function print_something() { function keyword can be omitted
print_something() {
    # Use $1 $2 to get the function parameters
    echo "Parameter 1: $1 Parameter2: $2"
    # Caller use $? to get the return value
    return 5
}
print_something 'value1' 'value2'
echo 'Function returns:', $?

# Variable scope
# By default, variables scope are global
var_change () {
    local var1='local 1'
    echo "Inside function: var1 is $var1 : var2 is $var2"
    var1='changed again'
    var2='2 changed again'
}
var1='global 1'
var2='global 2'
echo "Before function call: var1 is $var1 : var2 is $var2"
var_change
echo "After function call: var1 is $var1 : var2 is $var2"

