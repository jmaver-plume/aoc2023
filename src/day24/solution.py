from z3 import *


class Line:
    def __init__(self, start, velocity):
        self.start = start
        self.velocity = velocity

    def end(self):
        return self.start

    @staticmethod
    def from_raw_line(raw_line):
        raw_start, raw_velocity = raw_line.split(' @ ')
        start = tuple([int(float(v.strip())) for v in raw_start.split(',')])
        velocity = tuple([int(float(v.strip())) for v in raw_velocity.split(',')])
        return Line(start, velocity)



def solve():
    f = open('input.txt')
    data = f.read()
    raw_lines = data.split('\n')
    lines = [Line.from_raw_line(line) for line in raw_lines][:3]
    t1, t2, t3, x, y, z, vx, vy, vz = Reals('t1 t2 t3 x y z vx vy vz')
    equations = []
    for i, line in enumerate(lines):
        t = [t1, t2, t3][i]

        eq_x = line.start[0] + t * line.velocity[0] == x + t * vx
        equations.append(eq_x)

        eq_y = line.start[1] + t * line.velocity[1] == y + t * vy
        equations.append(eq_y)

        eq_z = line.start[2] + t * line.velocity[2] == z + t * vz
        equations.append(eq_z)
    solver = Solver()
    solver.add(equations)
    if solver.check() == sat:
        model = solver.model()
        x = int(model[x].as_decimal(10))
        y = int(model[y].as_decimal(10))
        z = int(model[z].as_decimal(10))
        sum = x + y + z
        print(f'sum = {sum}')
    else:
        print("No solution found")

solve()
