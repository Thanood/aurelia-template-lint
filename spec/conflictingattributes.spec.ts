
import {Linter, Rule, ParseState, RuleError, } from 'template-lint';
import {ConflictingAttributesRule, ConflictingAttributes} from '../source/rules/conflictingattributes';

describe("ConflictingAttributes Rule", () => {

  const DEFAULT_RULES_VIOLATION_SAMPLE = '<div repeat.for="item of items" if.bind="items"></div>';
  const linter: Linter = new Linter([
    new ConflictingAttributesRule()
  ]);

  function getLoneError(errors: RuleError[]) {
    expect(errors.length).toBe(1);
    return errors[0];
  }

  it("will pass repeat inside if", (done) => {
    linter.lint(`
      <template if.bind="items">
      <div repeat.for="item of items"></div>
      </template>
      `)
      .then((errors) => {
        expect(errors.length).toBe(0);
        done();
      });
    });

    it("will reject element where repeat and if is used", (done) => {
      linter.lint(DEFAULT_RULES_VIOLATION_SAMPLE)
      .then((errors) => {
        const errMsg = getLoneError(errors).message;
        expect(errMsg).toContain(ConflictingAttributesRule.ERRMSG_PREFIX);
        expect(errMsg).toContain("repeat.for");
        expect(errMsg).toContain("if.bind");
        done();
      });
    });

    it("will reject element where repeat and with is used", (done) => {
      // linter.lint('<div repeat.for="user of users" with.bind="user">${firstName} ${lastName}</div>')
      linter.lint('<div repeat.for="user of users" with.bind="user"></div>')
      .then((errors) => {
        const errMsg = getLoneError(errors).message;
        expect(errMsg).toContain(ConflictingAttributesRule.ERRMSG_PREFIX);
        expect(errMsg).toContain("repeat.for");
        expect(errMsg).toContain("with.bind");
        expect(errMsg).not.toContain("if.bind");
        done();
      });
    });

    it("can be constructed without arguments", (done) => {
      let rule = new ConflictingAttributesRule();
      expect(rule.conflictingAttributesList).toEqual(ConflictingAttributesRule.createDefaultConflictingAttributes());
      done();
    });

    it("can NOT be constructed with empty list", (done) => {
      expect(() => {
        new ConflictingAttributesRule([])
      }).toThrow();
      done();
    });

    it("allows replacing rules through constructor argument", (done) => {
      const customErrMsg = "Onclick doesn't make sense when disabled";
      const customConflictingAttributes = new ConflictingAttributes(["disabled", "onclick"], customErrMsg);
      const linter: Linter = new Linter([
        new ConflictingAttributesRule([customConflictingAttributes])
      ]);
      const validHTML = DEFAULT_RULES_VIOLATION_SAMPLE;
      const invalidHTML = '<button onclick="dummy()" disabled></button>';
      linter.lint(invalidHTML + validHTML)
      .then((errors) => {
        const errDetail = getLoneError(errors).detail;
        expect(errDetail).toContain(customErrMsg);
        done();
      });
    });

  });
