import { hello } from "../index";

describe("hello function", () => {
  it("should return hello world", () => {
    console.log(import.meta.url);
    expect(hello()).toBe("Hello World");
  });
});
