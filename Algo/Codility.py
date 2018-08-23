import unittest

# Help functions
def printArray(A):
    s = ""
    for i in A:
        s += str(i) + " "
    print(s)

# Lesson 1: BinaryGap:  Find longest sequence of zeros in binary representation of an integer. 
# https://app.codility.com/programmers/lessons/1-iterations/binary_gap/
def BinaryGap(N):
    max = 0
    count = -1
    while N > 0:
        if N & 1 == 0: # Check last bit
            if count >= 0: # Only if there is a counting
                count = count + 1
                if count > max:
                    max = count
        else:
            count = 0
        N = N >> 1
    return max
class L1_TestBinaryGap(unittest.TestCase):
    def test(self):
        self.assertEqual(5, BinaryGap(1041))
        self.assertEqual(1, BinaryGap(20))
        self.assertEqual(0, BinaryGap(32))

# Lesson 2: CyclicRotation: Rotate an array to the right by a given number of steps. 
# https://app.codility.com/programmers/lessons/2-arrays/cyclic_rotation/
def CyclicRotation(A, K):
    ret = A[:]
    if len(A) == 0: 
        return ret
    K = K % len(A)
    for i in range(len(A)):
        ret[(K + i) % len(A)] = A[i]
    return ret
class L2_TestCyclicRotation(unittest.TestCase):
    def test(self):
        self.assertEqual([1, 2, 3, 4], CyclicRotation([1, 2, 3, 4], 4))
        self.assertEqual([4, 1, 2, 3], CyclicRotation([1, 2, 3, 4], 1))
        self.assertEqual([9, 7, 6, 3, 8], CyclicRotation([3, 8, 9, 7, 6], 3))
        self.assertEqual([3, 8, 9, 7, 6], CyclicRotation([3, 8, 9, 7, 6], 0))

# Lession 2: OddOccurrencesInArray: Find value that occurs in odd number of elements. 
def OddOccurrencesInArray(A):
    map = {}
    for e in A:
        if map.get(e) != None:
            del map[e]
        else:
            map[e] = e
    return list(map.keys())[0]
class L2_OddOccurrencesInArray(unittest.TestCase):
    def test(self):
        self.assertEqual(7, OddOccurrencesInArray([9, 3, 9, 3, 9, 7, 9]))

# Lesson 3: TapeEquilibrium: Minimize the value |(A[0] + ... + A[P-1]) - (A[P] + ... + A[N-1])|. 
# https://app.codility.com/programmers/lessons/3-time_complexity/tape_equilibrium/
def TapeEquilibrium(A):
    size = len(A)
    rightSum = 0
    for i in range(1, size):
        rightSum += A[i]
    leftSum = A[0]
    minDiff = abs(leftSum - rightSum)
    for i in range(1, size - 1):
        leftSum += A[i]
        rightSum -= A[i]
        minDiff = min(abs(leftSum - rightSum), minDiff)
    return minDiff
class L3_TapeEquilibrium(unittest.TestCase):
    def test(self):
        self.assertEqual(1, TapeEquilibrium([3, 1, 2, 4, 3]))
        self.assertEqual(2, TapeEquilibrium([-1, 1]))
        self.assertEqual(1, TapeEquilibrium([-1, -1, -1, -1, -1]))
        self.assertEqual(0, TapeEquilibrium([1, 1, 1, 1]))

# Lesson 5: GenomicRangeQuery: Find the minimal nucleotide from a range of sequence DNA. 
# https://app.codility.com/programmers/lessons/5-prefix_sums/genomic_range_query/
def GenomicRangeQuery(S, P, Q):
    A = [0] * (len(S) + 1) # Array to store the count of A, count is in stored in i + 1 for position i,
    C = [0] * (len(S) + 1) # so that when P and Q positions are the same, use Q[i + 1] - P[i]
    G = [0] * (len(S) + 1)
    T = [0] * (len(S) + 1)
    for i, s in enumerate(S):
        A[i + 1] = A[i]
        C[i + 1] = C[i]
        G[i + 1] = G[i]
        T[i + 1] = T[i]
        if s == 'A':
            A[i + 1] += 1
        if s == 'C':
            C[i + 1] += 1
        if s == 'G':
            G[i + 1] += 1
        if s == 'T':
            T[i + 1] += 1
    ret = [0] * len(P)
    for i in range(len(P)):
        if A[Q[i] + 1] - A[P[i]] > 0: # Add 1 to handle position equal case
            ret[i] = 1
        elif C[Q[i] + 1] - C[P[i]] > 0:
            ret[i] = 2
        elif G[Q[i] + 1] - G[P[i]] > 0:
            ret[i] = 3
        elif T[Q[i] + 1] - T[P[i]] > 0:
            ret[i] = 4
    return ret
class L5_GenomicRangeQuery(unittest.TestCase):
    def test(self):
        self.assertEqual([2, 4, 1], GenomicRangeQuery("CAGCCTA", [2, 5, 0], [4, 5, 6]))

# Lesson 5: MinAvgTwoSlice: Find the minimal average of any slice containing at least two elements. 
# https://app.codility.com/programmers/lessons/5-prefix_sums/min_avg_two_slice/
# Min everage slice must be size 2 or 3
# Proof: https://github.com/daotranminh/playground/blob/master/src/codibility/MinAvgTwoSlice/proof.pdf
def MinAvgTwoSlice(A):
    min_idx = 0
    min_value = 10001
    for i in range(0, len(A) - 1):
        if (A[i] + A[i + 1]) / 2.0 < min_value:
            min_idx = i
            min_value = (A[i] + A[i + 1]) / 2.0
        if i < len(A) - 2 and (A[i] + A[i + 1] + A[i + 2] ) / 3.0 < min_value:
            min_idx = i
            min_value = (A[i] + A[i + 1] + A[i + 2]) / 3.0
    return min_idx
class L5_MinAvgTwoSlice(unittest.TestCase):
    def test(self):
        self.assertEqual(1, MinAvgTwoSlice([4, 2, 2, 5, 1, 5, 8]))

# Lesson 6: NumberOfDiscIntersections: Compute the number of intersections in a sequence of discs. 
# https://app.codility.com/programmers/lessons/6-sorting/number_of_disc_intersections/
# Explanation: http://www.lucainvernizzi.net/blog/2014/11/21/codility-beta-challenge-number-of-disc-intersections/
def NumberOfDiscIntersections(A):
    circle_points = [] 
    for i, a in enumerate(A):
        circle_points += [(i - a, True), (i + a, False)] # Start and end point on the x axis. True means start of a circle, false close
    circle_points.sort(key=lambda x: (x[0], not x[1])) # sort the circle points by the end points
    intersections, active_circles = 0, 0
    for _, is_start in circle_points:
        if is_start: # start a circle
            intersections += active_circles # There has been active_circles started
            active_circles += 1 
        else: # end of a circle, decrease the active circles
            active_circles -= 1
        if intersections > 10E6:
            return -1
    return intersections
class L6_NumberOfDiscIntersections(unittest.TestCase):
    def test(self):
        self.assertEqual(11, NumberOfDiscIntersections([1, 5, 2, 1, 4, 0]))

# Lesson 7: StoneWall: Cover "Manhattan skyline" using the minimum number of rectangles. 
# https://app.codility.com/programmers/lessons/7-stacks_and_queues/stone_wall/
def StoneWall(H):
    count = 0
    stack = []
    for _, e in enumerate(H):
        while len(stack) > 0 and stack[len(stack) - 1] > e: # Create rectangles for all heights > e
            count += 1
            stack.pop()
        if len(stack) == 0:
            stack.append(e)
        elif stack[len(stack) - 1] < e: # Only put in if taller
            stack.append(e)
    count += len(stack)
    return count
class L7_StoneWall(unittest.TestCase):
    def test(self):
        self.assertEqual(7, StoneWall([8, 8, 5, 7, 9, 8, 7, 4, 8]))
        self.assertEqual(3, StoneWall([1, 2, 3, 3, 2, 1]))

# Lesson 8: Dominator: Find an index of an array such that its value occurs at more than half of indices in the array. 
# https://app.codility.com/programmers/lessons/8-leader/dominator/
# Solution with O(n) time complexity: After removing a pair of elements of different values, the remaining still has the same leader
# Note: Returns the leader not the index as required by the test
def Dominator(A):
    candidate = None
    candidate_count = 0
    for i in range(len(A)):
        if candidate_count == 0:
            candidate_count += 1
            candidate = A[i]
        else:
            if candidate != A[i]:
                candidate_count -= 1
            else:
                candidate_count += 1
    if candidate_count == 0: # No leader
        return None
    candidate_count = 0
    for i in range(len(A)):
        if A[i] == candidate:
            candidate_count += 1
    if candidate_count > len(A) // 2:
        return candidate
    return None
class L8_Dominator(unittest.TestCase):
    def test(self):
        self.assertEqual(3, Dominator([3, 4, 3, 2, 3, -1, 3, 3]))
        self.assertEqual(None, Dominator([1, 2]))
        self.assertEqual(1, Dominator([2, 1, 1, 1, 3]))

# Lesson 9: MaxSliceSum: Find a maximum sum of a compact subsequence of array elements. 
def MaxSliceSum(A):
    max_slice = max_end = A[0]
    for i in range(1, len(A)):
        max_end = max(A[i], max_end + A[i]) # Max slice is either with the element ifself or plus previous max slice sum
        max_slice = max(max_slice, max_end) # Compare with the current maximum slice sum
    return max_slice
class L9_MaxSliceSum(unittest.TestCase):
    def test(self):
        self.assertEqual(5, MaxSliceSum([3, 2, -6, 4, 0]))
        self.assertEqual(1, MaxSliceSum([1]))
        self.assertEqual(-1, MaxSliceSum([-1, -2, -3]))

# Lesson 9: MaxDoubleSliceSum: Find the maximal sum of any double slice. 
# https://app.codility.com/programmers/lessons/9-maximum_slice_problem/max_double_slice_sum/
# Note: The maximum sum cannot be < 0 because i, i + 1, i + 2 will have a sum of 0 by definition
def MaxDoubleSliceSum(A):
    ending_here = [0] * len(A)
    starting_here = [0] * len(A)
    for idx in range(1, len(A)):
        ending_here[idx] = max(0, ending_here[idx-1] + A[idx]) # Max cannot be lower than 0
    for idx in reversed(range(len(A)-1)):
        starting_here[idx] = max(0, starting_here[idx+1] + A[idx])
    max_double_slice = 0    
    for idx in range(1, len(A)-1):
        max_double_slice = max(max_double_slice, starting_here[idx+1] + ending_here[idx-1])
    return max_double_slice
class L9_MaxDoubleSliceSum(unittest.TestCase):
    def test(self):
        self.assertEqual(17, MaxDoubleSliceSum([3, 2, 6, -1, 4, 5, -1, 2]))
        self.assertEqual(0, MaxDoubleSliceSum([-1, -1, -1, -1, -1])) # 0 is the possible maximum sum 

# Lesson 14: MinMaxDivision: Divide array A into K blocks and minimize the largest sum of any block. 
# https://app.codility.com/programmers/lessons/14-binary_search_algorithm/min_max_division/
def canBeDivided(A, K, max_sum): 
    sum = 0 # Used to store the sum of each division
    count = 0 # division count
    for e in A:
        if sum + e > max_sum: # current division sum > max_sum, so have to start a new division
            sum = e
            count += 1
        else:
            sum += e 
        if count >= K:
            return False
    return True
def MinMaxDivision(K, M, A):
    floor_sum = max(A)
    top_sum = sum(A)
    while floor_sum <= top_sum: # Binary search trying
        mid = (floor_sum + top_sum) // 2
        if canBeDivided(A, K, mid):
            top_sum = top_sum - 1
        else:
            floor_sum = floor_sum + 1            
    return floor_sum
class L14_MinMaxDivision(unittest.TestCase):
    def test(self):
        self.assertEqual(6, MinMaxDivision(3, 5, [2, 1, 5, 1, 2, 2, 2]))

# Run tests
if __name__ == '__main__':
    suite = unittest.TestSuite()
    tests = [
        L1_TestBinaryGap("test"),
        L2_TestCyclicRotation("test"),
        L2_OddOccurrencesInArray("test"),
        L3_TapeEquilibrium("test"),
        L5_GenomicRangeQuery("test"),
        L5_MinAvgTwoSlice("test"),
        L6_NumberOfDiscIntersections("test"),
        L7_StoneWall("test"),
        L8_Dominator("test"),
        L9_MaxSliceSum("test"),
        L9_MaxDoubleSliceSum("test"),
        L14_MinMaxDivision("test")
    ]
    suite.addTests(tests)

    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)
