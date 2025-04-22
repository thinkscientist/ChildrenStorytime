import { useState } from 'react'
import {
  Box,
  Button,
  FormControl as ChakraFormControl,
  FormLabel as ChakraFormLabel,
  Input,
  Select as ChakraSelect,
  Textarea,
  Stack,
  useToast as chakraUseToast,
  Text,
} from '@chakra-ui/react'

interface StoryInputs {
  mainCharacter: string
  setting: string
  theme: string
  moral: string
}

const StoryGenerator = () => {
  const [inputs, setInputs] = useState<StoryInputs>({
    mainCharacter: '',
    setting: '',
    theme: '',
    moral: '',
  })
  const [story, setStory] = useState('')
  const toast = chakraUseToast()

  const handleInputChange = (field: keyof StoryInputs) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setInputs({ ...inputs, [field]: e.target.value })
  }

  const generateStory = () => {
    // This is a simple story template - we can make it more sophisticated later
    const newStory = `Once upon a time, there was a ${inputs.mainCharacter} who lived in ${inputs.setting}. 
    They faced a challenge related to ${inputs.theme}. Through their journey, they learned that ${inputs.moral}. 
    And they all lived happily ever after!`

    setStory(newStory)
    toast({
      title: 'Story Created!',
      description: "Your magical story is ready!",
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Box>
      <Stack spacing={6} align="stretch">
        <ChakraFormControl isRequired>
          <ChakraFormLabel>Main Character</ChakraFormLabel>
          <Input
            placeholder="Enter the main character's name"
            value={inputs.mainCharacter}
            onChange={handleInputChange('mainCharacter')}
          />
        </ChakraFormControl>

        <ChakraFormControl isRequired>
          <ChakraFormLabel>Setting</ChakraFormLabel>
          <Input
            placeholder="Where does the story take place?"
            value={inputs.setting}
            onChange={handleInputChange('setting')}
          />
        </ChakraFormControl>

        <ChakraFormControl isRequired>
          <ChakraFormLabel>Theme</ChakraFormLabel>
          <ChakraSelect
            placeholder="Select a theme"
            value={inputs.theme}
            onChange={handleInputChange('theme')}
          >
            <option value="friendship">Friendship</option>
            <option value="courage">Courage</option>
            <option value="kindness">Kindness</option>
            <option value="perseverance">Perseverance</option>
          </ChakraSelect>
        </ChakraFormControl>

        <ChakraFormControl isRequired>
          <ChakraFormLabel>Moral of the Story</ChakraFormLabel>
          <Textarea
            placeholder="What lesson should be learned?"
            value={inputs.moral}
            onChange={handleInputChange('moral')}
          />
        </ChakraFormControl>

        <Button
          colorScheme="blue"
          size="lg"
          onClick={generateStory}
          disabled={!inputs.mainCharacter || !inputs.setting || !inputs.theme || !inputs.moral}
        >
          Generate Story
        </Button>

        {story && (
          <Box
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="md"
            border="2px"
            borderColor="blue.200"
          >
            <Text fontSize="lg" whiteSpace="pre-line">
              {story}
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

export default StoryGenerator 