import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import "../global.css";
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { MapPinIcon, CalendarDaysIcon } from 'react-native-heroicons/solid'
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForecast } from '@/api/weather';
import { weatherImages } from '@/constants';
import * as Progress from 'react-native-progress';
import { getData, storeData } from '@/utils/asyncStorage';


const HomeScreen = () => {
  const [showSearch, toggleSearch] = useState(false)
  const [locations, setLocations] = useState([])
  const [weather, setWeather] = useState({})

  const handleSearch = (value: string | any[]) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then(data => {
        setLocations(data)
        console.log('got Locations', data)
      })
    }
    console.log('value', value)

  }


  const handleTextDebounce = useCallback(debounce(handleSearch, 800), []);

  const { current, location } = weather;
  const [loading, setLoading] = useState(true)

  const handleLocation = (loc: any) => {
    console.log('location', loc)
    setLocations([])
    toggleSearch(false)
    setLoading(true)
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data => {
      setWeather(data)
      setLoading(false)
      storeData('city',loc.name);
  /*     console.log('got forecast: ', data) */
    })

  }

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city')
    let cityName='Chennai'
    if(myCity)cityName=myCity;
    
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data => {
      setWeather(data)
      setLoading(false)
    })
  }



  return (
    <View className='flex-1 relative'>
      <Text> Home Screen </Text>
      <StatusBar style="dark" />
      <Image blurRadius={70} source={require('../assets/images/Natural Moon and Sun with cloud cropped.jpeg')}
        className="absolute h-full w-full"
      />

      {loading ? (
        <View className='flex-1 justify-center items-center'>
        <Progress.CircleSnail thickness={10} size={140} color ='#0bb3b2'/>
      </View>
      ) :
      
        <SafeAreaView className='flex flex-1' 
        >
          {/* Search Section */
            <View style={{ height: '7%' }} className='mx-4 relative z-50'>
              <View className='flex-row justify-end items-center rounded-full'
                style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>
                {
                  showSearch ? (
                    <TextInput
                      onChangeText={handleTextDebounce}
                      placeholder='Search City'
                      placeholderTextColor={'lightgray'}
                      className="pl-6 pb-1 h-10 flex-1 text-base text-white"
                    />
                  ) : null
                }

                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)

                  }
                  style={{ backgroundColor: theme.bgWhite(0.3) }}
                  className="rounded-full p-3 m-1">

                  <MagnifyingGlassIcon size='25' color={'white'}></MagnifyingGlassIcon>
                </TouchableOpacity>
              </View>

              {
                locations.length > 0 && showSearch ? (
                  <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                    {
                      locations.map((loc, index) => {
                        let showBorder = index + 1 != locations.length;
                        let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : '';

                        return (
                          <TouchableOpacity
                            onPress={() => handleLocation(loc)}

                            key={index}
                            className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}
                          >
                            <MapPinIcon size='20' color={'gray'} />

                            <Text className='ml-2 text-black text-lg'> {loc?.name}, {loc.country}</Text>
                          </TouchableOpacity>
                        )
                      }
                      )
                    }
                  </View>

                ) : null
              }
            </View>
          }


          {
            /*  forecast Section */
          }
          
          <View className='mx-4 flex justify-around flex-1 mb-2 '>
            {/* location */}
            <Text className='text-white text-center text-2xl font-bold'>
              {location?.name}
              <Text className='text-lg font-semibold text-gray-300'>
                {", " + location?.country}
              </Text>
            </Text>
            {/* weather image */}
            <View className='flex-row justify-center'>
              <Image
                source={weatherImages[current?.condition?.text]}
                //source={require('../assets/images/partlycloudy.png')}
                className='w-52 h-52'>
              </Image>
            </View>

            {
              /* degree celsius data */
            }
            <View className='space-y-2'>
              <Text className='text-6xl text-white text-center font-bold'>
                {current?.temp_c}&#176;
              </Text>
              <Text className='text-xl text-white text-center mt-2 tracking-widest'>
                {current?.condition?.text}
              </Text>
            </View>

            {/* other states */}

            <View className='flex-row justify-between'>
              <View className='ml-5 flex-row'>
                <Image source={require('../assets/icons/wind.png')}
                  className='h-8 w-8'>
                </Image>
                <Text className=' ml-3 text-white text-xl'>
                  {current?.wind_kph}km
                </Text>
              </View>

              <View className='ml-5 flex-row'>
                <Image source={require('../assets/icons/drop.png')}
                  className='h-8 w-8'>
                </Image>
                <Text className=' ml-3 text-white text-xl'>
                  {current?.humidity}%
                </Text>
              </View>

              <View className='ml-5 flex-row'>
                <Image source={require('../assets/icons/sun.png')}
                  className='h-8 w-8'>
                </Image>
                <Text className=' ml-3 text-white text-xl'>
               {weather?.forecast?.forecastday[0]?.astro.sunrise}
                </Text>
              </View>

            </View>

            {/* Forecast for next days */}
            <View className='mb-2 space-y-3'>
              <View className='flex-row'>
                <CalendarDaysIcon size='22' color='white'></CalendarDaysIcon>
                <Text className='text-white ml-3 mb-2 text-base'>
                  Daily forecast
                </Text>
              </View>

              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}>

                {
                  weather?.forecast?.forecastday?.map((item, index) => {
                    let date = new Date(item.date);
                    let options = { weekday: 'long' };
                    let dayName = date.toLocaleDateString('en-US', options);
                    dayName = dayName.split(',')[0]



                    return (
                      <View className='flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4'
                        style={{ backgroundColor: theme.bgWhite(0.15) }}>
                        {/* <Image source={weatherImages[item?.day?.condition?.text]} */}
                        <Image source={weatherImages[item?.day?.condition?.text]}
                          className='h-11 w-11'>
                        </Image>
                        {console.log(item?.day?.condition?.text + ' - ' + dayName)}
                        <Text className='text-white'>{dayName}</Text>
                        <Text className='text-white'>{item?.day?.avgtemp_c}&#176;</Text>
                      </View>
                    )
                  })

                }

              </ScrollView>

            </View>





          </View>

        </SafeAreaView>
      }


    </View>
  )
}

export default HomeScreen