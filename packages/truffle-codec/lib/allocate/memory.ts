import debugModule from "debug";
const debug = debugModule("decoder-core:allocate:memory");

import { MemoryPointer } from "../types/pointer";
import { MemoryAllocations, MemoryAllocation, MemoryMemberAllocation } from "../types/allocation";
import { AstDefinition, AstReferences } from "truffle-codec-utils";
import * as CodecUtils from "truffle-codec-utils";

export function getMemoryAllocations(referenceDeclarations: AstReferences): MemoryAllocations {
  let allocations: MemoryAllocations = {};
  for(const node of Object.values(referenceDeclarations)) {
    if(node.nodeType === "StructDefinition") {
      allocations[node.id] = allocateStruct(node);
    }
  }
  return allocations;
}

//unlike in storage and calldata, we'll just return the one allocation, nothing fancy
//that's because allocating one struct can never necessitate allocating another
function allocateStruct(definition: AstDefinition): MemoryAllocation {
  let memberAllocations: MemoryMemberAllocation[] = [];
  let nonMappingIndex = 0;
  for(const member of definition.members) {
    if(CodecUtils.Definition.isMapping(member)) {
      memberAllocations.push({
        definition: member,
        pointer: null
      });
    }
    else {
      memberAllocations.push({
        definition: member,
        pointer: {
          location: "memory",
          start: nonMappingIndex * CodecUtils.EVM.WORD_SIZE,
          length: CodecUtils.EVM.WORD_SIZE
        }
      });
      nonMappingIndex++;
    }
  }

  return {
    definition,
    members: memberAllocations
  };
}