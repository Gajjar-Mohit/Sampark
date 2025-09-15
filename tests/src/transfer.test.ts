
function sum(a: number, b: number) {
  return a + b;
}

describe("IMPS Transfer", () => {
  test("adds 1 + 2 to equal 3", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
