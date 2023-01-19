import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Stack,
  StackDivider,
  Box,
  Text,
  Collapse,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import './App.css';

export default function SongCard({ hit }) {
  const { isOpen, onToggle } = useDisclosure();
  const fields = [
    'artist',
    'album',
    'releasedYear',
    'lyricist',
    'lyrics',
    'metaphor',
    'meaning',
    'source',
    'target',
  ];
  const fieldNames = [
    'Artist',
    'Album',
    'Released Year',
    'Lyricist',
    'Lyrics',
    'Metaphor',
    'Meaning',
    'Source',
    'Target',
  ];

  return (
    <div>
      <Stack alignItems="center">
        <Button width={1000} onClick={onToggle}>
          {hit?._source?.title} - {hit?._source?.artist || 'N/A'}
        </Button>
      </Stack>
      <Collapse in={isOpen} animateOpacity>
        <Stack alignItems="center" justifyContent="center">
          <Card width={1000}>
            <CardHeader>
              <Heading size="md">{hit?._source?.title}</Heading>
            </CardHeader>

            <CardBody>
              <Stack divider={<StackDivider />} spacing="4">
                {fields.map((field, idx) => (
                  <Box key={`songcard-${field}-${hit?._source?.id}`}>
                    <Heading size="xs" textTransform="uppercase">
                      {fieldNames[idx]}
                    </Heading>
                    <Text pt="2" fontSize="sm">
                      {hit?._source[field] ? hit._source[field] : 'N/A'}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </Collapse>
    </div>
  );
}
